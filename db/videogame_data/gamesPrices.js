const steamFetchModule = require('../../resellers_modules/steam');
const steamDump = require('./steamDump');
const hrkgameFetchModule = require('../../resellers_modules/hrkgame');
const gamivoFetchModule = require('../../resellers_modules/gamivo');
const cdkeysFetchModule = require('../../resellers_modules/cdkeys');

const utilities = require('../utilities');

const tableLastUpdate = utilities.logUpdateTable;
const mysqlConnection = utilities.connection;

/*
*   Module which interacts with the tables steam_games & games_prices
* */

// time in order to consider last update of the considered game prices too much old
const timeToNewRefresh = (60*60*24) * 3; //refresh game prices if it has been three days without update

/*
*   Get an object representing all the possibilities
* */
function getGamePrices(steamID){
    return new Promise((resolve, reject) => {
        steamDump.getGameBasicInfo(steamID)
            .then(gameData => {

                let refreshPrices = false;

                console.log("Game last update on " + gameData['lastUpdate']);

                if(!gameData['lastUpdate'])
                    refreshPrices = true;
                else{
                    let lastUpd = (new Date(gameData['lastUpdate']));
                    lastUpd.setSeconds(lastUpd.getSeconds() + timeToNewRefresh);
                    if(lastUpd < new Date())
                        refreshPrices = true;
                }

                let collectPricesPromise;

                if(refreshPrices)//need to refresh prices from sellers
                    collectPricesPromise = refreshGamePrices(gameData);
                else
                    collectPricesPromise = new Promise((res2)=> res2 (null));

                collectPricesPromise
                    .then(()=>{
                        selectGamePrices(gameData)
                            .then(gameDataPrices => resolve(gameDataPrices))
                            .catch(err => reject(err));
                    })

                    .catch(err => reject(err));

            })

            .catch(err => reject(err));
    });
}

/*  Select all resellers prices directly from db
* */
function selectGamePrices(gameData){
    return new Promise((resolve, reject)=>{

        if(!utilities.isGameData(gameData)){
            reject("Invalid input format");
        }

        mysqlConnection.query("SELECT reseller, link, availability, price FROM games_prices WHERE steam_id = ?",
            [gameData['steamID']],
            (error, results, fields) =>{

                if(error) {
                    reject(error);
                }else{
                    let gameDataPrices = gameData;
                    gameDataPrices['offers'] = [];

                    for(let i = 0; i<results.length; i++)
                        gameDataPrices['offers'].push(results[i]);

                    resolve(gameDataPrices);
                }
            })
    });
}

/*
*   Call all the resellers in order to update prices about a game
* */
function refreshGamePrices(gameData){
    let steamID = gameData['steamID'];
    let gameName = gameData['name'];
    console.log("Refreshing prices from seller for game " + gameName + "(" + steamID + ")");

    return new Promise((resolve, reject) => {

        if(!utilities.isGameData(gameData)) {
            reject("Invalid input format");
        }

        let promiseSteam = steamFetchModule.getSingleGameInfo(steamID);
        let promiseCDkeys = cdkeysFetchModule.getMatchingGameInfo(gameName, steamID);
        let promiseHRKgame = hrkgameFetchModule.getMatchingGameInfo(gameName, steamID);
        let promiseGamivo = gamivoFetchModule.getMatchingGameInfo(gameName, steamID);

        Promise.all([promiseSteam, promiseCDkeys, promiseHRKgame, promiseGamivo])
            .then(results => {

                let steamGameDataP ={
                    steamID: results[0]['steamID'],
                    reseller: "Steam",
                    availability: true,
                    link: results[0]['link'],
                    price: parseFloat((results[0]['price'].substring(0,results[0]['price'].length-1)).replace(',','.'))
                };

                console.log("SteamGameDataPrice(" + steamID + ") = " + JSON.stringify(steamGameDataP));

                let cdkeysGameDataP = null, hrkGameDataP = null, gamivoGameDataP = null;

                //cdkeys
                if(results[1]){
                    cdkeysGameDataP = {
                        steamID: results[0]['steamID'],
                        reseller: "CDKeys",
                        availability: results[1]['availability'] === "In Stock",
                        link: results[1]['link'],
                        price: parseFloat(results[1]['price'])
                    };
                }

                console.log("CDKeysGameDataPrice(" + steamID + ") = " + JSON.stringify(cdkeysGameDataP));

                //hrkgame
                if(results[2]){
                    hrkGameDataP = {
                        steamID: results[0]['steamID'],
                        reseller: "HRKGame",
                        availability: results[2]['availability'] === "in stock",
                        link: results[2]['link'],
                        price: parseFloat(results[2]['price'].substring(0,results[2]['price'].length-4))
                    };
                }

                console.log("HRKGameDataPrice(" + steamID + ") = " + JSON.stringify(hrkGameDataP));

                //gamivo
                if(results[3]){
                    gamivoGameDataP = {
                        steamID: results[0]['steamID'],
                        reseller: "Gamivo",
                        availability: results[3]['availability'] === "in stock",
                        link: results[3]['link'],
                        price: parseFloat(results[3]['price'].substring(0,results[3]['price'].length-4))
                    };
                }

                console.log("GamivoGameDataPrice(" + steamID + ") = " + JSON.stringify(gamivoGameDataP));

                insertUpdateGamePrices([steamGameDataP, cdkeysGameDataP, hrkGameDataP, gamivoGameDataP])
                    .then(() => {

                        //log last_update in steam_games
                        steamDump.updateGameInfo(gameData, true);
                        resolve(null);
                    })
                    .catch((err) => reject(err))

            })

            .catch(err => reject(err));
    });
}

/*
*   gamePrices is an array of prices to be added or updated into the table games_prices
* */
function insertUpdateGamePrices(gamePrices){
    return new Promise((resolve, reject) => {
        let refreshPromises = [];

        for(let i=0; i<gamePrices.length; i++){
            let gameP = gamePrices[i];
            if(utilities.isGameDataPrice(gameP)){
                existPricesInfo(gameP['steamID'], gameP['reseller'])
                    .then(exist => {

                        if(exist){
                            console.log("Updating " + JSON.stringify(gameP));
                            refreshPromises.push(updateGamePrice(gameP));

                        }else {
                            console.log("Inserting " + JSON.stringify(gameP));
                            refreshPromises.push(insertGamePrice(gameP));
                        }

                        if((i+1) === gamePrices.length)//here because before you need to check for the existence, otherwise promises haven't been pushed here yet
                            Promise.all(refreshPromises)
                                .then(() => {console.log("insertUpdate for game steam_id = " + gamePrices[0]['steamID'] + " terminated"); resolve(null);})
                                .catch(err => reject(err));

                    })
                    .catch(err => reject(err));
            }
        }

    });
}

/*  Check if game with such steamID sold by reseller is already in the table containing prices for different resellers
* */
function existPricesInfo(steamID, reseller){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT COUNT(*) as counter FROM games_prices WHERE steam_id = ? AND reseller = ?",
            [steamID, reseller],
            (error, results, fields) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(parseInt(results[0]['counter'])===1);
                }

            });
    });
}

/*  Update gamePrice info
* */
function updateGamePrice(gamePrice){
    return new Promise((resolve, reject) => {

        if(!utilities.isGameDataPrice(gamePrice)){
            reject("Invalid input format");
        }

        mysqlConnection.query("UPDATE games_prices SET link = ?, availability = ?, price = ? WHERE steam_id = ? AND reseller = ?",
            [gamePrice['link'], gamePrice['availability'], gamePrice['price'], gamePrice['steamID'], gamePrice['reseller']],
            (error, results, fields) =>{

                if(error) {
                    reject(error);
                }else{
                    resolve(results.affectedRows);
                }
            })
    });
}

/*  Insert gamePrice info
* */
function insertGamePrice(gamePrice){
    return new Promise((resolve, reject) => {

        if(!utilities.isGameDataPrice(gamePrice)){
            reject("Invalid input format");
        }

        mysqlConnection.query("INSERT INTO games_prices(steam_id, reseller, link, availability, price) VALUES(?,?,?,?,?)",
            [gamePrice['steamID'], gamePrice['reseller'], gamePrice['link'], gamePrice['availability'], gamePrice['price']],
            (error, results, fields) =>{

                if(error) {
                    reject(error);
                }else{
                    resolve(results.affectedRows);
                }
            })
    });
}

module.exports = {getGamePrices};
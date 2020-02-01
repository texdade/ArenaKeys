/*
*   Fetch and refresh videogame data through calling steam endpoints
*   & different resellers apis
* */

const steamDump = require('../db/videogame_data/steamDump');
const gamePricesCRUD = require('../db/videogame_data/gamesPrices');

const steamFetchModule = require('../resellers_modules/steam');
const hrkgameFetchModule = require('../resellers_modules/hrkgame');
const gamivoFetchModule = require('../resellers_modules/gamivo');
const cdkeysFetchModule = require('../resellers_modules/cdkeys');
const utilities = require('../db/utilities');

// time in order to consider last update of the considered game prices too much old
const timeToNewRefresh = (60*60*24) * 3; //refresh game prices if it has been three days without update

/*
*   Get an object representing all the possibilities in terms of game offers for the game having steamID
/*  Perform the actual computation in order to get game data & offers (with eventual refresh of data )
* */
function getGamePrices(steamID){
    return new Promise((resolve, reject) => {
        console.log("Finding offers for game with steamID " + steamID);
        //for computational reason, we can't consider invalid steamID
        if(!steamID)
            reject("Invalid steamID");

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
                        gamePricesCRUD.selectGamePrices(gameData)
                            .then(gameDataPrices => {
                                if(refreshPrices)
                                    gameDataPrices['lastUpdate'] = new Date();//just updated

                                resolve(gameDataPrices)
                            })
                            .catch(err => reject(err));
                    })

                    .catch(err => reject(err));

            })

            .catch(err => reject(err));
    });
}

/*
*   Get an object representing all the possibilities in terms of game offers for the games having a matching steamName
*  Perform the actual computation in order to get game data & offers (with eventual refresh of data )
* */
function getMatchingGamesPrices(name){
    return new Promise((resolve, reject) => {
        console.log("Finding games prices for game with matching name " + name);
        //for computational reason, we can't consider name which length is less than 2 characters
        if(name.length < 2)
            reject("Invalid name");

        steamDump.getMatchingGamesBasicInfo(name)
            .then(gamesData => {//gamesData will contain all the data of the matching gamesName

                console.log("Found the following nums of matching games: " + gamesData.length);

                //for computational reason, we can't consider more than 4 results
                let gameOffersPromises = [];
                for(let i=0; i<gamesData.length || i < 4; i++)
                    gameOffersPromises.push(getGamePrices(gamesData[i]['steamID']));

                Promise.all(gameOffersPromises)
                    .then(gamesOffers => resolve(gamesOffers))
                    .catch(err => reject(err));
            })

            .catch(err => reject(err));
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

        let existencePromises = [];//just check if the game price existed for that reseller

        //BEFORE check if the game price for that reseller already exist
        for(let i=0; i<gamePrices.length; i++){
            let gameP = gamePrices[i];
            if(utilities.isGameDataPrice(gameP)){
                existencePromises.push(gamePricesCRUD.existPricesInfo(gameP['steamID'], gameP['reseller']));
            }else{
                existencePromises.push(new Promise(resolve => resolve(false)));//to fill all the existences array (which is used below)
            }
        }

        //proceed to insert or update game prices given a specific reseller
        Promise.all(existencePromises).then(existences => {
            let refreshPromises = [];

            for(let i=0; i<gamePrices.length; i++){
                let gameP = gamePrices[i];
                if(utilities.isGameDataPrice(gameP)){
                    if(existences[i]){
                        console.log("Updating " + JSON.stringify(gameP));
                        refreshPromises.push(gamePricesCRUD.updateGamePrice(gameP));

                    }else {
                        console.log("Inserting " + JSON.stringify(gameP));
                        refreshPromises.push(gamePricesCRUD.insertGamePrice(gameP));
                    }
                }
            }

            Promise.all(refreshPromises)
                .then(() => {console.log("insertUpdate for game steam_id = " + gamePrices[0]['steamID'] + " terminated"); resolve(null);})
                .catch(err => reject(err));
        })

            .catch(err => reject(err));//error while checking for existences in games_prices

    });
}

/*  Just continue to fetch data from the steam API dump e caching it into our dump
* */
function refreshGamesDump(){
    steamDump.refreshDump(16000, false)//refresh dump trying to insert a new game every 16s (false to not have logs)
        .then(() => refreshGamesDump())//just call it again
        .catch(() => refreshGamesDump());//just call it again (even in case of error)
}

module.exports = {getGamePrices, getMatchingGamesPrices, refreshGamesDump};
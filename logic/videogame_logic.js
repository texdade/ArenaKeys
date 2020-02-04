/*
*   Fetch and refresh videogame data through calling steam endpoints
*   & different resellers apis
* */

const vgameHandler = require('../adapters/db_adapters/videogame_adapter');

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

        getGameBasicInfo(steamID)
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
                        vgameHandler.getCachedGamePrices(gameData)
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

/*  Fetch from the db (or from Steam if data is missing or requires a refresh)
* */
function getGameBasicInfo(steamID){
    return new Promise((resolve, reject) => {
        vgameHandler.getGameInfo(steamID).then(gameDataSelect => {
            //find if the data need a refresh from steam db
            let needRefresh = false;
            for (let key in gameDataSelect) {
                if (gameDataSelect[key] == null || gameDataSelect[key] === "") {
                    needRefresh = true;
                    break;
                }
            }

            if (!needRefresh)
                resolve({
                    steamID: steamID,
                    name: gameDataSelect['name'],
                    description: gameDataSelect['description'],
                    image: gameDataSelect['image_link'],
                    lastUpdate: gameDataSelect['last_update']
                });

            else {
                console.log("game basic info for game " + steamID + "  needs refresh");
                //game misses some basic data
                steamFetchModule.getSingleGameInfo(steamID)
                    .then(gameDataFetch => {
                        console.log(gameDataFetch);

                        if(gameDataFetch['discard']){//not a game
                            vgameHandler.deleteGameInfo(gameDataFetch).then(()=>reject(404)).catch(()=>reject(404));
                        }else{
                            let gameData = {
                                steamID: gameDataFetch['steamID'],
                                name: gameDataFetch['name'],
                                description: gameDataFetch['description'],
                                image: gameDataFetch['image'],
                                lastUpdate: null // needs to fetch data from reseller
                            };

                            //update the data on hosted db
                            vgameHandler.updateGameInfo(gameData, null)
                                .then(() => (console.log("Updated game general info with steamID: " + steamID)))
                                .catch((err) => (console.log("Failed to update game general info with steamID: " + steamID + "\n" + err)));

                            resolve(gameData);
                        }

                    })
                    .catch(error => reject(error));

            }
        }).catch(err => reject(err));
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

        vgameHandler.getCachedMatchingGamesInfo(name)
            .then(gamesData => {//gamesData will contain all the data of the matching gamesName

                console.log("Found the following nums of matching games: " + gamesData.length);
                console.log(gamesData);
                //for computational reason, we can't consider more than 4 results
                let gameOffersPromises = [];
                for(let i=0; i<gamesData.length; i++) {
                    gameOffersPromises.push(new Promise(resolve => {
                        getGamePrices(gamesData[i]['steamID'])
                            .then(gameOffers => resolve(gameOffers))
                            .catch(gameNotFound => resolve(404));
                    }));

                }

                Promise.all(gameOffersPromises)
                    .then(gamesOffers => {
                        //console.log("Extracted games offers " + JSON.stringify(gamesOffers));
                        let gamesOffersFinal = [];
                        for(let goff of gamesOffers)
                            if(utilities.isGameDataAndOffers(goff))
                                gamesOffersFinal.push(goff);

                        resolve(gamesOffersFinal);
                    })
                    .catch(err => {console.log(err);reject(err)});
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

        let promiseSteam = steamFetchModule.getSingleGameInfo(steamID);
        let promiseCDkeys = cdkeysFetchModule.getMatchingGameInfo(gameName, steamID);
        let promiseHRKgame = hrkgameFetchModule.getMatchingGameInfo(gameName, steamID);
        let promiseGamivo = gamivoFetchModule.getMatchingGameInfo(gameName, steamID);

        Promise.all([promiseSteam, promiseCDkeys, promiseHRKgame, promiseGamivo])
            .then(results => {

                let steamGameDataP = null, cdkeysGameDataP = null, hrkGameDataP = null, gamivoGameDataP = null;

                if(results[0] && results[0]['price']){
                    steamGameDataP ={
                        steamID: steamID,
                        reseller: "Steam",
                        availability: true,
                        link: results[0]['link'],
                        price: parseFloat((results[0]['price'].substring(0,results[0]['price'].length-1)).replace(',','.'))
                    };
                }
                console.log("SteamGameDataPrice(" + steamID + ") = " + JSON.stringify(steamGameDataP));

                //cdkeys
                if(results[1] && results[1]['price']){
                    cdkeysGameDataP = {
                        steamID: steamID,
                        reseller: "CDKeys",
                        availability: results[1]['availability'] === "In Stock",
                        link: results[1]['link'],
                        price: parseFloat(results[1]['price'])
                    };
                }

                console.log("CDKeysGameDataPrice(" + steamID + ") = " + JSON.stringify(cdkeysGameDataP));

                //hrkgame
                if(results[2] && results[2]['price']){
                    hrkGameDataP = {
                        steamID: steamID,
                        reseller: "HRKGame",
                        availability: results[2]['availability'] === "in stock",
                        link: results[2]['link'],
                        price: parseFloat(results[2]['price'].substring(0,results[2]['price'].length-4))
                    };
                }

                console.log("HRKGameDataPrice(" + steamID + ") = " + JSON.stringify(hrkGameDataP));

                //gamivo
                if(results[3] && results[3]['price']){
                    gamivoGameDataP = {
                        steamID: steamID,
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
                        vgameHandler.updateGameInfo(gameData, true);
                        resolve(null);
                    })
                    .catch((err) => reject(err))

            })

            .catch(err => {console.log(err);reject(err)});
    });
}

/*
*   gamePrices is an array of prices to be added or updated into the table games_prices
* */
function insertUpdateGamePrices(gamePrices){
    return new Promise((resolve, reject) => {

        let existencePromises = [];//just check if the game price existed for that reseller

        let steamID = null;//just for log reasons

        //BEFORE check if the game price for that reseller already exist
        for(let i=0; i<gamePrices.length; i++){
            let gameP = gamePrices[i];
            if(utilities.isGameDataPrice(gameP)){
                if(!steamID)//just for log reasons
                    steamID = gameP['steamID'];
                existencePromises.push(vgameHandler.existPricesInfo(gameP['steamID'], gameP['reseller']));
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
                        refreshPromises.push(vgameHandler.modifyGamePrice(gameP));

                    }else {
                        console.log("Inserting " + JSON.stringify(gameP));
                        refreshPromises.push(vgameHandler.addGamePrice(gameP));
                    }
                }
            }

            Promise.all(refreshPromises)
                .then(() => {console.log("insertUpdate for game steam_id = " + steamID + " terminated"); resolve(null);})
                .catch(err => {console.log(err);reject(err)});
        })

            .catch(err => reject(err));//error while checking for existences in games_prices

    });
}

//Add new games(steam_id + name) if not already present in the generic dump
//try to insert the game every interval (most of the insert will just fail 'cause the game is already present from previous inserts)
function refreshDumpRound(interval, LOG){
    return new Promise((resolve, reject) => {
        steamFetchModule.getAllGamesList()
            .then(list => {
                let queryPerformed = 0;
                let i = 0;
                for(let game of list){
                    setTimeout(() => {
                        vgameHandler.insertGameInfo(game)
                            .then(() => {
                                if(LOG)
                                    console.log("NEW GAME! Inserted " + game['name'] + " (id = " + game['steamID'] + ")");

                                queryPerformed++;
                                if(queryPerformed === list.length)
                                    resolve(null);
                            })
                            .catch(err => {
                                if(LOG)
                                    console.log(err.code + "\twhile inserting "+ game['name'] + " (id = " + game['steamID'] + ")");
                            });
                    },i*interval);
                    i++;
                }

            })

            .catch(err => reject(err));
    });
}


/*  Just continue to fetch data from the steam API dump e caching it into our dump
* */
function refreshGamesDump(){
    refreshDumpRound(16000, false)//refresh dump trying to insert a new game every 16s (false to not have logs)
        .then(() => refreshGamesDump())//just call it again
        .catch(() => refreshGamesDump());//just call it again (even in case of error)
}

module.exports = {getGamePrices, getMatchingGamesPrices, refreshGamesDump};
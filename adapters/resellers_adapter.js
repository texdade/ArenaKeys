/*
*   Module which tries to hide the differences behind the different services which provides key and info about the games
* */

const steamFetchModule = require('../resellers_modules/steam');
const hrkgameFetchModule = require('../resellers_modules/hrkgame');
const gamivoFetchModule = require('../resellers_modules/gamivo');
const cdkeysFetchModule = require('../resellers_modules/cdkeys');
const utilities = require('../db/utilities');
const stringSimilarity = require('string-similarity');

/*  Utility function for the actual to exposed which decides what action to perform and which reseller module to contact in order to have game info
* */
function getGameData(steamID, name, reseller){
    return new Promise((resolve, reject) => {
        if(!steamID || !reseller)
            reject("Invalid parameters");

        let gameDataPromise;

        if(reseller === "Steam")
            gameDataPromise = steamFetchModule.getSingleGameInfo(steamID);

        else if(name)//having the name and looking for a third party reseller better do a matching (i.e. if there is the steamID good, otherwise look for the game with the most similar title)
            gameDataPromise = getMatchingGameInfo(steamID, name, reseller);

        else if(reseller === "Gamivo")
            gameDataPromise = gamivoFetchModule.getSingleGameInfo(steamID);

        else if(reseller === "HRKGame")
            gameDataPromise = hrkgameFetchModule.getSingleGameInfo(steamID);

        else if(reseller === "CDKeys")
            gameDataPromise = cdkeysFetchModule.getSingleGameInfo(steamID);

        else {
            if(process.env.LOG)
                console.log("Invalid reseller info");
            gameDataPromise = new Promise((resolve1, reject1) => reject1(null));
        }

        gameDataPromise.then(data => {
            if(process.env.LOG)
                console.log(data);

            resolve(data)
        }).catch(err => reject(err));

    });
}

//get game general info (descr, image,...) given the steamID
function getGameBasicInfo(steamID, name, reseller){
    return new Promise((resolve, reject) => {

        getGameData(steamID, name, reseller)
            .then(gameData => {

            if(!gameData || !utilities.isGameData(gameData))//game not found or steam id wasn't present
                resolve(null);

            let gameDataResult ={
                steamID: steamID,
                reseller: reseller,
                name: gameData['name'],
                description: gameData['description'],
                image: gameData['image'],
                link: gameData['link']
            };

            resolve(gameDataResult);
        }).catch(err => reject(err));

    });
}

//get game price info given the steamID and a specific reseller (eventually the name)
function getGamePriceInfo(steamID, name, reseller){
    return new Promise((resolve, reject) => {

        getGameData(steamID, name, reseller).then(gamePriceData => {

            if(!gamePriceData)//game not found or steam id wasn't present
                resolve(null);

            if(reseller === "Steam" && gamePriceData['price'])
                gamePriceData['availability'] = 1;

            let gamePriceDataResult = {
                steamID: steamID,
                reseller: reseller,
                link: gamePriceData['link'],
                price: gamePriceData['price'],
                availability: gamePriceData['availability']
            };

            resolve(gamePriceDataResult);
        }).catch(err => reject(err));

    });
}

//returns the price of the games with a matching name in proper formatted json, if steamID is present give priority to it
function getMatchingGameInfo(steamID, gameName, reseller){

    let gamesPriceInfoP;

    if(reseller === "Gamivo")
        gamesPriceInfoP = gamivoFetchModule.getAllGamesInfo();

    else if(reseller === "HRKGame")
        gamesPriceInfoP = hrkgameFetchModule.getAllGamesInfo();

    else if(reseller === "CDKeys")
        gamesPriceInfoP = cdkeysFetchModule.getAllGamesInfo();

    else
        gamesPriceInfoP = new Promise((resolve, reject) => reject([]));

    return new Promise((resolve, reject) => {
        gameName = gameName.toLowerCase();

        gamesPriceInfoP
            .then(data => {
                let bestIndex = -1;
                let bestSimilarity = parseFloat(process.env.STRING_SIMILARITY_THRESHOLD);
                for(let i=0; i<data.length; i++){
                    if(steamID && data[i]['steamID'] && steamID === data[i]['steamID'])//found the exact game by ID
                        resolve(data[i]);

                    if(data[i]['name']) {
                        let dataName = data[i]['name'].toLowerCase();
                        let similarity = stringSimilarity.compareTwoStrings(gameName, dataName);

                        if(similarity > bestSimilarity){
                            bestSimilarity = similarity;
                            bestIndex = i;
                        }
                    }

                }
                if(bestIndex > 0)
                    resolve(data[bestIndex]);
                else
                    resolve(null);//not founded
            })

            .catch(err => reject(err));
    });
}

/*  Get official app dump from steam (just pairs of names and steamID)
* */
function getOfficialAppDump(){
    return new Promise((resolve, reject) => {
        steamFetchModule.getAllGamesList().then(list => resolve(list)).catch(err => reject(err));
    })
}


module.exports = {getGamePriceInfo, getGameBasicInfo, getOfficialAppDump};
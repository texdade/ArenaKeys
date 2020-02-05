/*  Adapter for the userlist data layer
* */
const gamesPricesDAO = require('../../db/videogame_data/gamesPrices');
const steamDumpDAO = require('../../db/videogame_data/steamDump');

const utilities = require('../../db/utilities');

const stringSimilarity = require("string-similarity");

/*  Select all resellers prices directly from db (cached ones)
* */
function getCachedGamePrices(gameData){
    return new Promise((resolve, reject)=>{

        if(!utilities.isGameData(gameData)){
            reject("Invalid input format");

        }else{
            gamesPricesDAO.selectGamePrices(gameData)
                .then(gameDataOffers => {
                    let offers = [];
                    for(let offer of gameDataOffers['offers'])
                        offers.push({
                            steamID: gameData['steamID'],
                            reseller: offer['reseller'],
                            link: offer['link'],
                            availability: offer['availability'],
                            price: offer['price']
                        });

                    gameDataOffers['offers'] = offers;
                    resolve(gameDataOffers);
                })
                .catch(err => reject(err));
        }

    });
}

/*  Check if game with such steamID sold by reseller is already in the table containing prices for different resellers
* */
function existPricesInfo(steamID, reseller){
    return new Promise((resolve, reject) => {
        if(steamID && reseller){
            gamesPricesDAO.selectGamePrices({steamID:steamID}).then(gameDataOffers => {
                for(let offer of gameDataOffers['offers'])
                    if(offer['reseller'].toLowerCase() === reseller.toLowerCase())
                        resolve(true);

                resolve(false);
            })

        }else{
            reject(400);
        }
    });
}

/*  Update gamePrice info (returning true if it was a success)
* */
function modifyGamePrice(gamePrice){
    return new Promise((resolve, reject) => {

        if(!utilities.isGameDataPrice(gamePrice)){
            reject("Invalid input format");

        }else{
            gamesPricesDAO.updateGamePrice(gamePrice).then(affectedRows => {
                resolve(affectedRows === 1);
            })
            .catch(err => reject(err));
        }

    });
}

/*  Insert gamePrice info
* */
function addGamePrice(gamePrice){
    return new Promise((resolve, reject) => {

        if(!utilities.isGameDataPrice(gamePrice)){
            reject("Invalid input format");

        }else{
            gamesPricesDAO.insertGamePrice(gamePrice).then(affectedRows => {
                resolve(affectedRows === 1);
            })
                .catch(err => reject(err));
        }
    });
}

/*  Delete all gamePrices info for a game
* */
function deleteGamePrices(steamID){
    return new Promise((resolve, reject) => {

        if(!steamID){
            reject("Invalid input format");

        }else{
            gamesPricesDAO.deleteGamePricesForGame(steamID).then(affectedRows => {
                resolve(affectedRows > 0);
            })
                .catch(err => reject(err));
        }
    });
}


//insert name, description, image link, steam ID, last update
function insertGameInfo(gameData){
    return new Promise((resolve, reject)=>{
        if(utilities.isGameData(gameData)){
            steamDumpDAO.insertGameInfo(gameData).then(affRows => {
                    if(affRows === 1)
                        resolve(gameData);
                    else
                        reject(500);
                })
                .catch(err => reject(err));

        }else{
            reject("Invalid format");

        }
    });
}

//update name, description, image link and eventually last_update for a game in the dump
function updateGameInfo(gameData, refreshLastUpdate){

    let lastUpdate = " ";
    if(refreshLastUpdate)
        lastUpdate = ", last_update = NOW() ";

    return new Promise((resolve, reject)=>{
        if(utilities.isGameData(gameData)){
            steamDumpDAO.updateGameInfo(gameData, lastUpdate).then(affRows => {
                if(affRows === 1)
                    resolve(gameData);
                else
                    reject(404);
            }).catch(err => reject(err));

        }else{
            reject("Invalid format");
        }
    });
}

//delete name, description, image link and eventually last_update for a game in the dump
function deleteGameInfo(gameData){

    return new Promise((resolve, reject)=>{
        if(utilities.isGameData(gameData)){
            steamDumpDAO.deleteGameInfo(gameData).then(affRows => {
                if(affRows === 1)
                    resolve(gameData);
                else
                    reject(500);
            }).catch(err => reject(err));

        }else{
            reject("Invalid format");
        }
    });
}

//return name, description, image link, last_update
function getGameInfo(steamID){
    return new Promise((resolve, reject)=>{
        steamDumpDAO.getGameBasicInfo(steamID).then(gameInfo => resolve(gameInfo)).catch(err => reject(err));
    });
}

/*  Fetch JUST from the db (no refresh implied... just too much expensive)
* */
function getCachedMatchingGamesInfo(name){

    return new Promise((resolve, reject) => {
        steamDumpDAO.getMatchingGamesBasicInfo(name).then(gamesInfoFetched => {
            let gamesInfo = [];
            let similarityThreshold = parseFloat(process.env.STRING_SIMILARITY_THRESHOLD);
            for(let gameDataSelect of gamesInfoFetched)
                if(myCompareTwoStrings(name, gameDataSelect['name']) > similarityThreshold)
                    gamesInfo.push({
                        steamID: gameDataSelect['steam_id'],
                        name: gameDataSelect['name'],
                        description: gameDataSelect['description'],
                        image: gameDataSelect['image_link'],
                        lastUpdate: gameDataSelect['last_update']
                    });

            resolve(gamesInfo);
        })
            .catch(err => reject(err));
    });
}

/*  Using the original compareTwoStrings of string similarity module but considering the best matching (we stop if we surpass the threshold) over all possible substrings of name2
* */
function myCompareTwoStrings(name1, name2){
    if(!name1 || !name2)
        return 0.0;

    name1 = name1.toLowerCase();
    name2 = name2.toLowerCase();

    return stringSimilarity.compareTwoStrings(name1, name2);
}

module.exports = {  getCachedGamePrices, existPricesInfo, modifyGamePrice, addGamePrice, deleteGamePrices,
                    insertGameInfo, updateGameInfo, deleteGameInfo, getGameInfo, getCachedMatchingGamesInfo
};
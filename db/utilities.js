//db connection
const mysql = require('mysql');
let connection = mysql.createConnection({
        host: 'remotemysql.com',
        user: 'bmjNX6on7f',
        password: '2mwKzl3a96',
        database: 'bmjNX6on7f'
    });

/*  Check validity of object gameData
* */
function isGameData(gameData){
    return gameData && gameData['steamID'] && gameData['name'] && gameData['image'] && gameData['description'];
}

/*  Check validity of object gameDataPrice
* */
function isGameDataPrice(gameDataP){
    return gameDataP && gameDataP['steamID'] && gameDataP['reseller'] && gameDataP['link'] && gameDataP['price'] && (gameDataP['availability'] !== undefined);
}

function isGameDataAndOffers(gameDataO){
    return isGameData(gameDataO) && areGameDataPrices(gameDataO['offers']);
}

/*  Check validity of array gameDataPrices
* */
function areGameDataPrices(gameDataPs){
    for(let gameDataP of gameDataPs)
        if(!isGameDataPrice(gameDataP))
            return false;

    return true;
}

/*  Check validity of object list
* */
function isList(list){
    return isListNoId(list) && list['id'];
}

/*  Check validity of object list
* */
function isListNoId(list){
    return list && list['userId'] && list['name'] && (list['notifyMe'] !== undefined) && Array.isArray(list['items']);
}

module.exports = {connection, isGameData, isGameDataPrice, areGameDataPrices, isGameDataAndOffers, isList, isListNoId};
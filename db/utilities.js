//db connection
const mysql = require('mysql');
let connection = mysql.createConnection({
        host: 'remotemysql.com',
        user: 'bmjNX6on7f',
        password: '2mwKzl3a96',
        database: 'bmjNX6on7f'
    });

function logUpdateTable(tableName){
    return new Promise((resolve, reject) => {

        connection.query("UPDATE last_update SET dt_update = NOW() WHERE t_name = ?)",
            [tableName],
            (error, results, fields) =>{
                if(error) {
                    reject(error);
                }else{
                    resolve(null);
                }

            });
    });
}

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

function isUser(user){
    return isUserNoId(user) && user['id']
}

function isUserNoId(user){
    return user && (user['steamUserId'] || user['googleUserId']) && user['name'] && (user['steamProfileUrl'] || user['email'])
}

module.exports = {connection, logUpdateTable, isGameData, isGameDataPrice, areGameDataPrices, isList, isListNoId, isUser, isUserNoId};
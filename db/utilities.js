//db connection
const mysql = require('mysql');
let connection;
let db_config = {
        host: 'remotemysql.com',
        user: 'bmjNX6on7f',
        password: '2mwKzl3a96',
        database: 'bmjNX6on7f'
    };

connection = mysql.createConnection(db_config);
/*
function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.

    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}*/

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

function isUser(user){
    return isUserNoId(user) && user['id'];
}

function isUserNoId(user){
    return user && (user['steamUserId'] || user['googleUserId']) && user['name'] && (user['steamProfileUrl'] || user['email']);
}

module.exports = {connection, isGameData, isGameDataPrice, areGameDataPrices, isGameDataAndOffers, isList, isListNoId, isUser, isUserNoId};
/*
*   Module which interacts with the tables steam_games & games_prices
* */

const utilities = require('../utilities');
const mysqlConnection = utilities.connection;

/*  Select all resellers prices directly from db
* */
function selectGamePrices(gameData){
    return new Promise((resolve, reject)=>{

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

/*  Update gamePrice info
* */
function updateGamePrice(gamePrice){
    return new Promise((resolve, reject) => {

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

/*  Delete gamePrice info
* */
function deleteGamePrice(gamePrice){
    return new Promise((resolve, reject) => {

        mysqlConnection.query("DELETE FROM games_prices WHERE steam_id = ? AND reseller = ?",
            [gamePrice['steamID'], gamePrice['reseller']],
            (error, results, fields) =>{

                if(error) {
                    reject(error);
                }else{
                    resolve(results.affectedRows);
                }
            })
    });
}

/*  Delete gamePrices info for a game
* */
function deleteGamePricesForGame(steamID){
    return new Promise((resolve, reject) => {

        mysqlConnection.query("DELETE FROM games_prices WHERE steam_id = ?",
            [steamID],
            (error, results, fields) =>{

                if(error) {
                    reject(error);
                }else{
                    resolve(results.affectedRows);
                }
            })
    });
}

module.exports = {selectGamePrices, insertGamePrice, updateGamePrice, deleteGamePrice, deleteGamePricesForGame};
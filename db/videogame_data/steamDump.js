/*  Module which interacts with the db table containing basic info about a steam app cached from http://api.steampowered.com/ISteamApps/GetAppList/v0002/
* */

const utilities = require('../utilities');
const mysqlConnection = utilities.connection;


//insert name, description, image link, steam ID, last update
function insertGameInfo(gameData){
    return new Promise((resolve, reject)=>{
        mysqlConnection.query("INSERT INTO steam_games (name, description, image_link, steam_id, last_update) VALUES (?,?,?,?, NOW())",
            [gameData['name'], gameData['description'], gameData['image'], gameData['steamID']],
            (error, results, fields) =>{
                if(error)
                    reject(error);

                else
                    resolve(results.affectedRows);
            });
    });
}

//update name, description, image link and eventually last_update
function updateGameInfo(gameData, refreshLastUpdate){
    return new Promise((resolve, reject)=>{
        mysqlConnection.query("UPDATE steam_games SET name = ?, description = ?, image_link = ?" + refreshLastUpdate + "WHERE steam_id = ?",
            [gameData['name'], gameData['description'], gameData['image'], gameData['steamID']],
            (error, results, fields) =>{
                if(error)
                    reject(error);

                else
                    resolve(results.affectedRows);
            });
    });
}

//delete name, description, image link and eventually last_update
function deleteGameInfo(gameData){
    return new Promise((resolve, reject)=>{
        mysqlConnection.query("DELETE FROM steam_games WHERE steam_id = ?",
            [gameData['steamID']],
            (error, results, fields) =>{
                if(error)
                    reject(error);

                else
                    resolve(results.affectedRows);
            });
    });
}


/*  Fetch from the db (or from Steam if data is missing or requires a refresh)
* */
function getGameBasicInfo(steamID){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT name, image_link, description, last_update FROM steam_games WHERE steam_id = ?",
            [steamID],
            (error, results, fields) =>{

                let gameDataSelect = results[0];
                //console.log(gameDataSelect);

                if(error) {
                    reject(error);
                }else{
                    //find if the data need a refresh from steam db
                    resolve(gameDataSelect);
                }


            });
    });
}

/*  Fetch JUST from the db (no refresh implied... just too much expensive)
* */
function getMatchingGamesBasicInfo(name){
    //console.log("Finding in db matching games for title " + name);
    name = name.split(' ').join('%');
    let nameLike = '%'+name+'%';//query LIKE value
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT steam_id, name, image_link, description, last_update FROM steam_games WHERE name LIKE ?",
            [nameLike],
            (error, results, fields) =>{

                if(error) {
                    reject(error);
                }else{
                    resolve(results);
                }


            });
    });
}

module.exports = {insertGameInfo, updateGameInfo, deleteGameInfo, getGameBasicInfo, getMatchingGamesBasicInfo};
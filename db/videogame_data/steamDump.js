const steamFetchModule = require('../../resellers_modules/steam');
const utilities = require('../utilities');
const tableLastUpdate = utilities.logUpdateTable;
const mysqlConnection = utilities.connection;


/*
* Module to get and update basic info about a game which means steamID and name
* Note that in normal condition of operativity, just the refreshDump() function will be useful and continuously running
* every x days in order to maintain the whole list of games as much complete as possible
* */

//cleanup the current dump of steamID+name
//NOTE Used just for init
/*
function deleteDump(){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("TRUNCATE TABLE steam_games", [], (error, results, fields) =>{
            if (error) {
                reject (error);
            }

            let retval = undefined;
            if (results.affectedRows)
                retval = results.affectedRows;

            resolve(retval);
        });
    });

}
*/

//refresh the dump of steamID+name, by reinserting all video games
//NOTE Used just for init
/*
function refreshDumpBruteForce(){
    return new Promise((resolve, reject) => {
        deleteDump()
            .then(()=> {
                steamFetchModule.getAllGamesList()
                    .then(list => {
                        let queryPerformed = 0;

                        for(let game of list){
                            console.log("Inserting " + game['name'] + " (id = " + game['steamID'] + ")");
                            mysqlConnection.query("INSERT INTO steam_games(steam_id, name) VALUES(?,?)",
                                [game['steamID'], game['name']],
                                (error, results, fields) =>{

                                    if(error) {
                                        console.log("ERROR while inserting "+ game['name'] + " (id = " + game['steamID'] + ")");
                                        console.log(error);
                                    }else{
                                        console.log("Inserted " + game['name'] + " (id = " + game['steamID'] + ")");
                                    }

                                    queryPerformed++;
                                    if(queryPerformed == list.length)
                                        tableLastUpdate()//record that the dump has been updated adding new games
                                            .then(()=>resolve(null))
                                            .catch(err => reject(err));

                                });
                        }

                    })

                    .catch(err => reject(err));
            })

            .catch(err => reject(err));
    });
}
*/

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
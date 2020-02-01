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

//refresh the dump of steamID+name, by reinserting all video games
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

//Add new games(steam_id + name) if not already present in the generic dump
//try to insert the game every interval (most of the insert will just fail 'cause the game is already present from previous inserts)
function refreshDump(interval, LOG){
    return new Promise((resolve, reject) => {
        steamFetchModule.getAllGamesList()
            .then(list => {
                let queryPerformed = 0;
                let i = 0;
                for(let game of list){
                    setTimeout(() => {
                        if(LOG)
                            console.log("Inserting " + game['name'] + " (id = " + game['steamID'] + ")");
                        mysqlConnection.query("INSERT INTO steam_games(steam_id, name) VALUES(?,?)",
                            [game['steamID'], game['name']],
                            (error, results, fields) =>{

                                if(error) {
                                    //TODO add this if, to have less logs
                                    //if(error.code !== 'ER_DUP_ENTRY'){
                                        // probably this would mean that game is already inserted in 99% of the cases...
                                        // no trouble, just go on (error will happen most of the time)
                                        if(LOG)
                                            console.log(error.code + "\twhile inserting "+ game['name'] + " (id = " + game['steamID'] + ")");
                                    //}
                                }else{
                                    if(LOG)
                                        console.log("NEW GAME! Inserted " + game['name'] + " (id = " + game['steamID'] + ")");
                                }

                                queryPerformed++;
                                if(queryPerformed === list.length)
                                    tableLastUpdate()//record that the dump has been updated
                                        .then(()=>resolve(null))
                                        .catch(err => reject(err));

                            });
                    },i*interval);
                    i++;
                }

            })

            .catch(err => reject(err));
    });
}

//insert name, description, image link, steam ID, last update
function insertGameInfo(gameData){
    return new Promise((resolve, reject)=>{
        if(utilities.isGameData(gameData)){
            mysqlConnection.query("INSERT INTO steam_games (name, description, image_link, steam_id, last_update) VALUES (?,?,?,?, NOW())",
                [gameData['name'], gameData['description'], gameData['image'], gameData['steamID']],
                (error, results, fields) =>{
                    if(error)
                        reject(error);
                    else if(results.affectedRows === 1)
                        resolve();
                    else
                        reject();
                });
        }else{
            reject("Invalid format");
        }
    });
}

//update name, description, image link and eventually last_update
function updateGameInfo(gameData, refreshLastUpdate){

    let lastUpdate = " ";
    if(refreshLastUpdate)
        lastUpdate = ", last_update = NOW() ";

    return new Promise((resolve, reject)=>{
        if(utilities.isGameData(gameData)){
            mysqlConnection.query("UPDATE steam_games SET name = ?, description = ?, image_link = ?"+lastUpdate+"WHERE steam_id = ?",
                [gameData['name'], gameData['description'], gameData['image'], gameData['steamID']],
                (error, results, fields) =>{
                    if(error)
                        reject(error);
                    else if(results.affectedRows === 1)
                        resolve();
                    else
                        reject();
                });
        }else{
            reject("Invalid format");
        }
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
                    let needRefresh = false;
                    for(let key in gameDataSelect){
                        if(gameDataSelect[key]==null || gameDataSelect[key]===""){
                            needRefresh = true;
                            break;
                        }
                    }

                    if(!needRefresh)
                        resolve({
                            steamID: steamID,
                            name: gameDataSelect['name'],
                            description: gameDataSelect['description'],
                            image: gameDataSelect['image_link'],
                            lastUpdate: gameDataSelect['last_update']
                        });
                    else{
                        //game misses some basic data
                        steamFetchModule.getSingleGameInfo(steamID)
                            .then(gameDataFetch => {
                                console.log(gameDataFetch);
                                let gameData = {
                                    steamID: gameDataFetch['steamID'],
                                    name: gameDataFetch['name'],
                                    description: gameDataFetch['description'],
                                    image: gameDataFetch['image'],
                                    lastUpdate: null // needs to fetch data from reseller
                                };

                                //update the data on hosted db
                                updateGameInfo(gameData, null)
                                    .then(()=>(console.log("Updated game general info with steamID: " + steamID)))
                                    .catch((err)=>(console.log("Failed to update game general info with steamID: " + steamID + "\n" + err)));

                                resolve(gameData);
                            })
                            .catch(error => reject(error));
                    }
                }


            });
    });
}

/*  Fetch JUST from the db (no refresh implied... just too much expensive)
* */
function getMatchingGamesBasicInfo(name){
    console.log("Finding in db matching games for title " + name);
    let nameLike = '%'+name+'%';//query LIKE value
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT steam_id, name, image_link, description, last_update FROM steam_games WHERE name LIKE ?",
            [nameLike],
            (error, results, fields) =>{

                if(error) {
                    reject(error);
                }else{
                    let gamesInfo = [];
                    for(let gameDataSelect of results)
                        gamesInfo.push({
                            steamID: gameDataSelect['steam_id'],
                            name: gameDataSelect['name'],
                            description: gameDataSelect['description'],
                            image: gameDataSelect['image_link'],
                            lastUpdate: gameDataSelect['last_update']
                        });

                    resolve(gamesInfo);
                }


            });
    });
}

module.exports = {refreshDumpBruteForce, refreshDump, insertGameInfo, updateGameInfo, getGameBasicInfo, getMatchingGamesBasicInfo};
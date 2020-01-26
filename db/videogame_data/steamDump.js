const steamFetchModule = require('../../resellers_modules/steam');
const tableLastUpdate = require('../utilities').logUpdateTable;
const mysqlConnection = require('../utilities').connection;

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
function refreshDump(){
    return new Promise((resolve, reject) => {
        steamFetchModule.getAllGamesList()
            .then(list => {
                let queryPerformed = 0;

                for(let game of list){
                    console.log("Inserting " + game['name'] + " (id = " + game['steamID'] + ")");
                    mysqlConnection.query("INSERT INTO steam_games(steam_id, name) VALUES(?,?)",
                        [game['steamID'], game['name']],
                        (error, results, fields) =>{

                            if(error) {
                                // probably this would mean that game is already inserted in 99% of the cases...
                                // no trouble, just go on (error will happen most of the time)
                                console.log("ERROR while inserting "+ game['name'] + " (id = " + game['steamID'] + ")");
                                console.log(error);
                            }else{
                                console.log("Inserted " + game['name'] + " (id = " + game['steamID'] + ")");
                            }

                            queryPerformed++;
                            if(queryPerformed == list.length)
                                tableLastUpdate()//record that the dump has been updated
                                    .then(()=>resolve(null))
                                    .catch(err => reject(err));

                        });
                }

            })

            .catch(err => reject(err));
    });
}

module.exports = {refreshDumpBruteForce, refreshDump};
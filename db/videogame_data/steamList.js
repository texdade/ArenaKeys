const steamFetchModule = require('../../resellers_modules/steam');
const tableLastUpdate = require('../utilities').logUpdateTable;
const mysqlConnection = require('../utilities').connection;

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

//refresh the dump of steamID+name
function refreshDump(){
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
                                        tableLastUpdate()
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

refreshDump();

module.exports = {refreshDump};
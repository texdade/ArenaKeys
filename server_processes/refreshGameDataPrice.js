/*  Background process which repetitively iterate getBasicInfo and getPrices over the games in the dump in order to cache their data to boost up researches made by users
* */

const videogameLogic = require('../logic/videogame_logic');

//Add new games(steam_id + name) if not already present in the generic dump
//try to insert the game every interval (most of the insert will just fail 'cause the game is already present from previous inserts)
function refresh16GamesRandomDump(interval){
    return new Promise((resolve, reject) => {
        if(process.env.LOG)
            console.log("Starting new batch of silent refresh of 16 elements");

        videogameLogic.getOfficialAppDump()
            .then(list => {
                let promises = [];
                for(let i =0; i<list.length && i<16;i++){
                    let game = list[parseInt(Math.random()*list.length)];
                    if(process.env.LOG)
                        console.log("Selected game " + JSON.stringify(game));
                    promises.push(new Promise(resolvePro => {
                        setTimeout(() => {
                            videogameLogic.insertGameInfo(game)
                                .then(() => {
                                    if(process.env.LOG)
                                        console.log("NEW GAME! Inserted " + game['name'] + " (id = " + game['steamID'] + ")");

                                    videogameLogic.getGame(game['steamID'], true, true)//to refresh all data regarding this game (info & prices from different resellers)
                                        .then(() => resolvePro(null)).catch(()=>resolvePro(null));//do nothing in case of success or failure (this is just a refresh procedure on a single game)
                                })
                                .catch(err => {
                                    if(process.env.LOG)
                                        console.log(err.code + "\twhile inserting "+ game['name'] + " (id = " + game['steamID'] + ")");

                                    videogameLogic.getGame(game['steamID'], true, true)//to refresh all data regarding this game (info & prices from different resellers)
                                        .then(() => resolvePro(null)).catch(()=>resolvePro(null));//do nothing

                                });
                        },i*interval);
                    }));
                }

                Promise.all(promises).then(()=>resolve(null)).catch(()=>resolve(null));//just go on, nothing we're intereseted in (this is supposed to be a background process)

            })

            .catch(err => reject(err));
    });
}


/*  Just continue to fetch data from the steam API dump e caching it into our dump
* */
function refreshGamesDump(){
    refresh16GamesRandomDump(process.env.INTERVAL || 16000)//refresh dump trying to insert a new game every 16s (false to not have logs)
        .then(() => {{console.log("Restart refresh process");refreshGamesDump();}})//just call it again
        .catch(() => {console.log("Restart refresh process (after an error has been occurred)");refreshGamesDump();});//just call it again (even in case of error)
}

module.exports = {refreshGamesDump};
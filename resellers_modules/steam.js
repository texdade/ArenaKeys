const fetch = require("node-fetch-npm");

const urlSingleGame = "https://store.steampowered.com/api/appdetails/?appids="; //incomplete url for single game info
const urlAllGamesList = "http://api.steampowered.com/ISteamApps/GetAppList/v0002/";

//invoke steam API for infos about the game
function getAppDetail(steamID) {
    return fetch(urlSingleGame+steamID);
}

//invoke fetching of the whole list with steamID + name of the game
function getDumpList(){
    return fetch(urlAllGamesList);
}

//returns the price of the specified game in proper formatted json
function getSingleGameInfo(steamID){
    return new Promise((resolve, reject) => {
        getAppDetail(steamID)
            .then(res => {
                res.json().then(game => {

                    if(!game[steamID]["success"])
                        reject(undefined);

                    else{
                        let gameInfo = {
                            steamID: game[steamID]["data"]["steam_appid"], //steamID
                            name: game[steamID]["data"]["name"], //name
                            image: game[steamID]["data"]["header_image"], //link to image
                            description: game[steamID]["data"]["short_description"],
                            price: game[steamID]["data"]["price_overview"]["final_formatted"] //price already formatted as string
                        };
                        //console.log(gameInfo);
                        resolve(gameInfo);
                    }


                });
        })
        .catch(err => reject(err)); // error while fetching
    });
}

//returns whole list of steamID, game title
function getAllGamesList(){
    return new Promise((resolve, reject)=>{
        getDumpList()
           .then(res => {
               res.json().then(gamesList => {
                  let games = [];
                  for(let game of gamesList['applist']['apps']){
                      games.push(
                          {
                              steamID: game['appid'],
                              name: game['name']
                          }
                      );
                  }
                  resolve(games);

               });
           })

           .catch(err => reject(err));
    });
}

module.exports = {getAllGamesList, getSingleGameInfo};
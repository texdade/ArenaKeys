const fetch = require("node-fetch-npm");

const urlSingleGame = "https://store.steampowered.com/api/appdetails/?appids="; //incomplete url for single game info
const urlAllGamesList = "http://api.steampowered.com/ISteamApps/GetAppList/v0002/";
const urlSteamWishlist = "https://store.steampowered.com/wishlist/id/"

//invoke steam API for infos about the game
function getAppDetail(steamID) {
    return fetch(urlSingleGame+steamID);
}

//invoke fetching of the whole list with steamID + name of the game
function getDumpList(){
    return fetch(urlAllGamesList);
}

function getUserWishlist(userID){
    url=urlSteamWishlist+userID+"/wishlistdata/?p=0";
    return fetch(url);
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
                            link: "https://store.steampowered.com/app/"+steamID, //link to steam store item
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

//return the user's wishlist on steam (but also removes all free/unreleased games)
function getUserSteamWishlist(userID){
    return new Promise((resolve, reject) => {
        getUserWishlist(userID)
            .then(res => {
                res.json().then(gameList => {
                    let wishlist = [];
                    let wishlistIDs = Object.keys(gameList); //get all steamIDs from wishlist in order to navigate it
                    wishlistIDs.forEach(id => {
                        if(!gameList[id]["is_free_game"]){ //if game is not free (we can't sell free things)
                            if(!gameList[id]["subs"].length<1){ //if the game currently has a price, which is contained in an array in "subs"
                                let game={
                                    steamID: id,
                                    name: gameList[id]["name"],
                                    price: gameList[id]["subs"]["0"]["price"]
                                };
                                wishlist.push(game);
                            }
                        }
                    });
                    resolve(wishlist);
                });
            })
            .catch(err => reject(err));
    });
}

module.exports = {getAllGamesList, getSingleGameInfo, getUserSteamWishlist};


const fetch = require("node-fetch-npm");

const urlSingleGame = "https://store.steampowered.com/api/appdetails/?appids="; //incomplete url for single game info
const urlAllGamesListv2 = "http://api.steampowered.com/ISteamApps/GetAppList/v0002/";
const urlAllGamesListv1 = "http://api.steampowered.com/ISteamApps/GetAppList/v0001/";
const urlSteamWishlist = "https://store.steampowered.com/wishlist/profiles/";

const NodeCache = require( "node-cache" );
const mcache = new NodeCache();

const cacheDumpKey = 'steamDumpCache';
const cacheDuration = process.env.CACHE_DUR || 60 * 60;

//invoke steam API for infos about the game
function getAppDetail(steamID) {
    return fetch(urlSingleGame+steamID);
}

//invoke fetching of the whole list with steamID + name of the game
function getDumpList(v1, v2){
    if(v1)
        return fetch(urlAllGamesListv1);
    else
        return fetch(urlAllGamesListv2);
}

function getUserWishlist(userID){
    let url = urlSteamWishlist+userID+"/wishlistdata";
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
                            price: undefined
                        };

                        if(game[steamID]["data"]["price_overview"] && game[steamID]["data"]["release_date"]["coming_soon"])//has still to be released
                            resolve(gameInfo);

                        if(game[steamID]["data"]["type"] !== "game") {//not a game
                            gameInfo["discard"] = true;
                            resolve(gameInfo);
                        }

                        if(game[steamID]["data"]["price_overview"])//steam doesn't sell it anymore
                            gameInfo['price'] = game[steamID]["data"]["price_overview"]["final_formatted"]; //price already formatted as string;

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
        let cachedData = mcache.get(cacheDumpKey);
        if(cachedData)
            resolve(cachedData);
        else{

            getDumpList(false, true)
                .then(res => {
                    res.json().then(gamesList => {
                        let games = [];
                        for (let game of gamesList['applist']['apps']) {
                            games.push(
                                {
                                    steamID: game['appid'],
                                    name: game['name']
                                }
                            );
                        }

                        if (games.length > 0) {
                            mcache.set(cacheDumpKey, games, cacheDuration);//caching dump
                            resolve(games);
                        }else { //call v001 if the list is still empty (sometimes v0002 answers with empty body)
                            getDumpList(true, false)
                                .then(res => {
                                    res.json().then(gamesList => {

                                        games = [];

                                        for (let game of gamesList['applist']['apps']['app']) {
                                            games.push(
                                                {
                                                    steamID: game['appid'],
                                                    name: game['name']
                                                }
                                            );
                                        }
                                        mcache.set(cacheDumpKey, games, cacheDuration);//caching dump
                                        resolve(games);
                                    }).catch(err => reject(err));

                                })
                                .catch(err => reject(err));
                        }
                    })

                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        }
    });
}

//return the user's wishlist on steam (but also removes all free/unreleased games)
function getUserSteamWishlist(userID){
    return new Promise((resolve, reject) => {
        getUserWishlist(userID)
            .then(res => {
                res.json().then(gameList => {
                    resolve(gameList);

                }).catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

module.exports = {getAllGamesList, getSingleGameInfo, getUserSteamWishlist};


const fetch = require("node-fetch-npm");
const Parser = require('papaparse');

const url = "https://store.steampowered.com/api/appdetails/?appids="; //uncomplete url
 
//invoke steam API for infos about the game
function getInfos(steamID) {
    return fetch(url+steamID);
}

//returns the price of the specified game in proper formatted json
function getPrice(steamID){
    return new Promise((resolve, reject) => {
        getInfos(steamID)
            .then(res => {
                res.json().then(game => {
                    let infos = {
                        steamID: game[steamID]["data"]["steam_appid"], //steamID
                        name: game[steamID]["data"]["name"], //name
                        image: game[steamID]["data"]["header_image"], //link to image
                        price: game[steamID]["data"]["price_overview"]["final_formatted"] //price already formatted as string                     
                    };                 
                    
                    resolve(infos);
                });
        })
        .catch(err => reject(err)); // error while fetching
    });
}

module.exports = {getPrice};
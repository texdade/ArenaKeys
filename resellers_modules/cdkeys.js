const fetch = require("node-fetch-npm");
const Parser = require('papaparse');
const stringSimilarity = require("string-similarity");

const url = "https://adm.cdkeys.com/feeds/cdkeys_affiliate_feed_eur.txt";
 
//raw dump of reseller's db
function getDump() {
    return fetch(url);
}

//returns info of all games in proper formatted json
//note that CDKeys has a steamID field but it's empty (at least at the time of writing of this code)
function getAllGamesInfo(){
    return new Promise((resolve, reject) => {
        getDump()
        
        .then(res => {
                res.text().then(text => {
                    let result = Parser.parse(text); //NOTE: no need to specify delimiters/newlines because autodetects
                    
                    let games = [];
                    for(let i=0; i<result.data.length; i++){
                        //json generation
                        let game = {
                            internalID: result.data[i][0], //cdKeys internal id
                            name: result.data[i][1], //name
                            link: result.data[i][2], //link
                            imageLink: result.data[i][3], //image link
                            price: result.data[i][4], //price
                            brand: result.data[i][5], //brand
                            availability: result.data[i][6], //availability
                            steamID: result.data[i][7], //steamID
                            category: result.data[i][8] //category
                        };
                        games.push(game);
                    }
                    //console.log(JSON.stringify(games));
                    resolve(games);
                });
        }) 

        .catch(err => reject(err)); // error while fetching
    });
    
}


//returns the price of the specified game in proper formatted json
function getSingleGameInfo(steamID){
    return new Promise((resolve, reject) => {

        getAllGamesInfo()
            .then(data => {
                for(let i=0; i<data.length; i++){
                    if(data[i]["steamID"] && steamID === data[i]["steamID"]){
                        resolve(data[i]);
                        break;
                    }
                }
                resolve(null);
            })

            .catch(err => reject(err));
    });
}

module.exports = {getAllGamesInfo, getSingleGameInfo};
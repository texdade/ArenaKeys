const fetch = require("node-fetch-npm");
const Parser = require('papaparse');
const stringSimilarity = require("string-similarity");

const url = "https://adm.cdkeys.com/feeds/cdkeys_affiliate_feed_eur.txt";

const NodeCache = require( "node-cache" );
const mcache = new NodeCache();

const cacheKey = 'cdkeysCache';
const cacheDuration = process.env.CACHE_DUR || 60 * 60 * 24;

//raw dump of reseller's db
function getDump() {
    let cachedData = mcache.get(cacheKey);
    if(!cachedData){
	console.log("CDKeys DUMP no cached data!");
        return fetch(url);
    }else{
	console.log("CDKeys DUMP found cached data");
        return new Promise((resolve) => resolve(cachedData));
    }
}


//returns info of all games in proper formatted json
//note that CDKeys has a steamID field but it's empty (at least at the time of writing of this code)
function getAllGamesInfo(){
    return new Promise((resolve, reject) => {
        console.log("GET ALL GAMES CDKeys");
	getDump()
        
        .then(res => {
                let textPromise;
		console.log("GOT DUMP from CDKeys");
                let cachedData = mcache.get(cacheKey);

                if(!cachedData)
                    textPromise = res.text();
                else
                    textPromise = new Promise(resolve => resolve(res));

                textPromise.then(text => {

                    if(!cachedData){
                        mcache.set(cacheKey, text, cacheDuration); //cached gamivo dump locally
                    }

                    let result = Parser.parse(text); //NOTE: no need to specify delimiters/newlines because autodetects
                    
                    let games = [];
                    for(let i=0; i<result.data.length; i++){
                        //json generation
			console.log("inspecting CDKeys game " + result.data[i][1]);
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
		    console.log("Finished inspecting CDKeys dump");
                    //console.log(JSON.stringify(games));
                    resolve(games);
                });
        }) 

        .catch(err => reject(err)); // error while fetching
    });
    
}


//returns the price of the specified game in proper formatted json
function getSingleGameInfo(steamID){
    console.log("CIAOOOOOOO");
    return new Promise((resolve, reject) => {
	console.log("CDKEYS getSingleGameInfo");
        getAllGamesInfo()
            .then(data => {
                for(let i=0; i<data.length; i++){
                    if(data[i]["steamID"] && steamID === data[i]["steamID"]){
                        console.log("CDKEYS getSingleGameInfo FOUND!");
			resolve(data[i]);
                        break;
                    }
                }
                resolve(null);
            })

            .catch(err => {console.log(err); reject(err)});
    });
}

module.exports = {getAllGamesInfo, getSingleGameInfo};

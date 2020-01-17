const fetch = require("node-fetch-npm");
const Parser = require('papaparse');

const url = "https://adm.cdkeys.com/feeds/cdkeys_affiliate_feed_eur.txt";
 
//raw dump of reseller's db
function getDump() {
    return fetch(url);
}

//returns the [name, price, availability] of all games in proper formatted json
//note that CDKeys has a steamID field but it's empty (at least at the time of writing of this code)
function getPrices(){
    getDump()
        .then(res => res.text()) //res.text returns a promise too
        .then(text => {
            let result = Parser.parse(text); //NOTE: no need to specify delimiters/newlines because autodetects
            let games = [];
            for(let i=0; i<result.data.length; i++){
                //json generation
                let game = {
                    name: result.data[i][1], //name
                    price: result.data[i][4], //price
                    availability: result.data[i][6] //availability
                };
                games.push(game);
            }
            //TODO: return as promise
            console.log(JSON.stringify(games));
        }); 
}

//returns the price of the specified game in proper formatted json
function getPrice(steamId, gameName){

}

module.exports = {getPrices, getPrice};
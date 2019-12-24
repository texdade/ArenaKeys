const fetch = require("node-fetch-npm");
const Parser = require('papaparse')

const url = "https://adm.cdkeys.com/feeds/cdkeys_affiliate_feed_eur.txt";
 
//raw dump of reseller's db
function getDump() {
    return fetch(url)
}

//returns the prices of all games in proper formatted json
function getPrices(){
    getDump()
        .then(res => res.text()) //res.text returns a promise too
        .then(text => {
            return Parser.parse(text).jsonify
        }); 
}

//returns the price of the specified game in proper formatted json
function getPrice(steamId){

}


module.exports = {getPrices, getPrice};
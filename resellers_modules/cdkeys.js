const fetch = require("node-fetch-npm");
const Parser = require('papaparse');

const url = "https://adm.cdkeys.com/feeds/cdkeys_affiliate_feed_eur.txt";
 
//raw dump of reseller's db
function getDump() {
    return fetch(url);
}

//returns the prices of all games in proper formatted json
function getPrices(){
    getDump()
        .then(res => res.text()) //res.text returns a promise too
        .then(text => {
            let result = Parser.parse(text); //NOTE: no need to specify delimiters/newlines because autodetects
            for(let i=0; i<result.data.length; i++){
                console.log(result.data[i][1]);
            }
        }); 
}

//returns the price of the specified game in proper formatted json
function getPrice(steamId){

}

getPrices();

module.exports = {getPrices, getPrice};
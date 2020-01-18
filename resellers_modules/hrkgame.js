const fetch = require("node-fetch-npm");
const xpath = require("xpath");
const dom = require("xmldom").DOMParser;
const xml2js = require("xml2js");

const url = "https://www.hrkgame.com/en/hotdeals/xml-feed/?key=F546F-DFRWE-DS3FV&cur=EUR";
 
//raw dump of reseller's db
function getDump() {
    return fetch(url);
}

//returns the info of all games in proper formatted json
//note that Gamivo has an internal ID field but it doesn't come with the steamID (at least at the time of writing of this code)
function getAllGamesInfo(){
    return new Promise((resolve, reject) => {
        
        getDump()
            .then(res => {
                res.text().then(text => {
                    
                    let doc = new dom().parseFromString(text, 'text/xml');
                    let result = xpath.evaluate(
                        "/rss/channel/item",            // xpathExpression
                        doc,                        // contextNode
                        null,                       // namespaceResolver
                        xpath.XPathResult.ANY_TYPE, // resultType
                        null                        // result
                    );
                    
                    let games = [];
        
                    node = result.iterateNext();
                    while (node) {
                        //console.log(node.toString());
                        xml2js.parseString(node.toString(), function(err, result){
                            //console.log(result);
                            
                            let shippingObj = {
                                price: result['item']['g:shipping'][0]['g:price'][0],
                                weight:result['item']['g:shipping_weight'][0]
                            };

                            let taxObj = {
                                rate: result['item']['g:tax'][0]['g:rate'][0],
                                taxShip: result['item']['g:tax'][0]['g:tax_ship'][0]
                            };
                            

                            let game = {
                                internalID: result['item']['g:id'][0]['_'],
                                name: result['item']['title'][0], //name
                                link: result['item']['link'][0], //link
                                imageLink: result['item']['g:image_link'][0], //image link
                                price: result['item']['g:price'][0], //price                               
                                availability: result['item']['g:availability'][0], //availability
                                steamID: result['item']['steam_appid'][0], //steamID WE DON'T HAVE IT :-(
                                category: result['item']['g:google_product_category'][0], //category (useless here.... just google id for videogames)
                                
                                //TODO ask Tex for the followings
                                description: result['item']['description'][0], //description 
                                publishers: result['item']['publishers'][0], //publishers
                                developers: result['item']['developers'][0], //developers
                                platform: result['item']['platform'][0], //publishers
                                condition: result['item']['g:condition'][0],
                                retailPrice: result['item']['g:retail_price'][0], //retail price
                                tax: taxObj, //tax
                                shipping: shippingObj //shipping
                            };
                            //console.log(game);
                            games.push(game);
                            
                        });
                        node = result.iterateNext();
                    }

                    resolve(games);

                });
        }) 

        .catch(err => reject(err)); // error while fetching
    });
    
}

//returns the price of the specified game in proper formatted json
function getSingleGameInfo(steamID, gameName){
    return new Promise((resolve, reject) => {

        getAllGamesInfo()
            .then(data => {
                for(let i=0; i<data.length; i++){

                    if((data[i]["steamID"] && steamID == data[i]["steamID"]) || data[i]["name"].indexOf(gameName)!=-1){
                        resolve(data[i]);
                        break;
                    }
                }
            })

            .catch(err => reject(err));
    });
}

module.exports = {getAllGamesInfo, getSingleGameInfo};
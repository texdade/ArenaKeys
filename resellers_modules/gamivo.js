const fetch = require("node-fetch-npm");
const xpath = require("xpath");
const dom = require("xmldom").DOMParser;
const xml2js = require("xml2js");

const url = "https://www.gamivo.com/feed/eur/en/feed.xml";
 
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
                            let game = {
                                internalID: result['item']['g:id'][0]['_'],
                                name: result['item']['title'][0], //name
                                link: result['item']['link'][0], //link
                                imageLink: result['item']['g:image_link'][0], //image link
                                price: result['item']['g:price'][0], //price
                                brand: result['item']['g:brand'][0], //brand
                                availability: result['item']['g:availability'][0], //availability
                                steamID: undefined, //steamID WE DON'T HAVE IT :-(
                                category: result['item']['g:google_product_category'][0], //category (useless here.... just google id for videogames)

                                //TODO ask Tex for the followings
                                description: result['item']['g:description'][0], //it's a mess of html
                                region: result['item']['g:region'][0],
                                condition: result['item']['g:condition'][0],
                                customLabel: result['item']['g:custom_label_0'][0],
                                stockLabel: result['item']['stock_below_20'][0]
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
            })

            .catch(err => reject(err));
    });
}


//returns the price of the games with a matching name in proper formatted json, if steamID is present give priority to it
function getMatchingGameInfo(gameName, steamID){
    return new Promise((resolve, reject) => {
        const diff = (a,b) => (a.split(b).join('')).length; //returns the differences in terms of letters by string a and string b

        getAllGamesInfo()
            .then(data => {
                let bestIndex = -1;
                let bestDiff = gameName.length + 100;//init to high value
                for(let i=0; i<data.length; i++){

                    if(steamID && data[i]['steamID'] && steamID === data[i]['steamID'])//found the exact game by ID
                        resolve(data[i]);

                    if(data[i]['name']) {
                        if(diff(data[i]['name'], gameName) < bestDiff){
                            bestDiff = diff(data[i]['name'], gameName);
                            bestIndex = i;
                        }

                        if(diff(gameName, data[i]['name']) < bestDiff){
                            bestDiff = diff(gameName, data[i]['name']);
                            bestIndex = i;
                        }
                    }

                }
                if(bestIndex > 0)
                    resolve(data[bestIndex]);
                else
                    resolve(null);//not founded
            })

            .catch(err => reject(err));
    });
}

module.exports = {getAllGamesInfo, getSingleGameInfo, getMatchingGameInfo};
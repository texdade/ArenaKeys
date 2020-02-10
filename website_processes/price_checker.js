const fetch = require('node-fetch-npm');
const utilities = require('../db/utilities');

let apiBaseUrl = "https://ec2-34-245-97-253.eu-west-1.compute.amazonaws.com";
if(process.env.LOCAL)
    apiBaseUrl = "http://localhost:3000";

function getGameOffer(steamId){
    
    return new Promise((resolve, reject) => {
        fetch(apiBaseUrl + '/videogame/'+steamId)
            .then(data => data.json()
                .then(gameOffer => resolve(gameOffer).catch(err => reject(err)))
            )
            .catch(err => reject(err));
    })

}

function getGameOffers(name){
    return new Promise((resolve, reject) => {
        fetch(apiBaseUrl + '/videogame?name='+name)
            .then(data => data.json()
                .then(gameOffers => resolve(gameOffers).catch(err => reject(err)))
            )
            .catch(err => reject(err));
    })

}

module.exports = {getGameOffer, getGameOffers}
const fetch = require('node-fetch-npm')
const utilities = require('../db/utilities');

let apiBaseUrl = "https://gamekeys-arena.herokuapp.com";
if(process.env.LOCAL)
    apiBaseUrl = "http://localhost:3000";

function tryGetUserList(gToken, sToken, details, offers){
    return new Promise((resolve, reject) => {
        let token = (gToken || sToken);
        let options = {
            method: 'get',
            headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
        };

        let listsPromise;

        let detailsOffers = '?';
        if(!details)
            detailsOffers += 'details=false&';
        if(!offers)
            detailsOffers += 'offers=false';

        if (sToken)
            listsPromise = fetch(apiBaseUrl + '/steam/userlist'+detailsOffers, options);
        else if (gToken)
            listsPromise = fetch(apiBaseUrl + '/google/userlist'+detailsOffers, options);
        else
            reject(400);

        listsPromise
            .then(fetched => {
                let status = fetched.status;

                fetched.json()
                    .then(lists => {
                        let listCheck = true;

                        for (let el of lists)
                            if (!utilities.isList(el))
                                listCheck = false;

                        if (parseInt(status) === 200 && listCheck)
                            resolve(lists);
                        else//could be a 400, 401, 404
                            reject(status);

                    }).catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

module.exports = {tryGetUserList};
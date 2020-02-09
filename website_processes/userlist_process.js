const fetch = require('node-fetch-npm');
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

        const requireUserlistSteam = '/steam/userlist';
        const requireUserlistGoogle = '/google/userlist';

        if (sToken)
            listsPromise = fetch(apiBaseUrl + requireUserlistSteam + detailsOffers, options);
        else if (gToken)
            listsPromise = fetch(apiBaseUrl + requireUserlistGoogle + detailsOffers, options);
        else
            reject(400);

        listsPromise
            .then(fetched => {
                let status = fetched.status;

                fetched.json()
                    .then(lists => {//could be an array of lists or a single one (depends if id is valid or not)
                        let check = true;

                        for (let el of lists)
                            if (!utilities.isList(el))
                                check = false;

                        if (parseInt(status) === 200 && check)
                            resolve(lists);

                        else//could be a 400, 401, 404
                            reject(status);

                    }).catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

module.exports = {tryGetUserList};
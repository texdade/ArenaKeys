const fetch = require('node-fetch-npm')
const utilities = require('../db/utilities');

let apiBaseUrl = "http://ec2-34-245-97-253.eu-west-1.compute.amazonaws.com:3000";
if(process.env.LOCAL)
    apiBaseUrl = "http://localhost:3000";

function tryGetUserInfo(gToken, sToken){
    return new Promise((resolve, reject) => {
        let userPromise;
        if(gToken)
            userPromise = fetch(apiBaseUrl+"/google/user?access_token="+gToken);
        else if(sToken)
            userPromise = fetch(apiBaseUrl+"/steam/user?access_token="+sToken);
        else   
            resolve (null);

        userPromise
            .then(fetched => {
                let status = fetched.status;
                fetched.json()
                    .then(user => {
                        if(parseInt(status) === 200 && utilities.isUser(user))
                            resolve(user);
                        else//could be a 400, 401, 404
                            reject(status);

                    }).catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

function createNewUser(user, token){
    return new Promise((resolve, reject) => {
        let options = {
            method: 'post',
            body:    JSON.stringify(user),
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        }

        let newUserPromise;

        if(user["steamUserId"])
            newUserPromise = fetch(apiBaseUrl+'/steam/user', options);
        else if (user["googleUserId"])
            newUserPromise = fetch(apiBaseUrl+'/google/user', options);
        else {
            reject(400);
        }

        newUserPromise
            .then(fetched => {
                let status = fetched.status;
                
                fetched.json()
                    .then(user => {
                        if(parseInt(status) === 201 && utilities.isUser(user))
                            resolve(user);
                        else//could be a 400, 401, 404
                            reject(status);

                    }).catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

function updateUser(user, token){
    return new Promise((resolve, reject) => {
        let options = {
            method: 'put',
            body:    JSON.stringify(user),
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        }

        let updatedUserPromise;

        if(user["steamUserId"])
            updatedUserPromise = fetch(apiBaseUrl+'/steam/user', options);
        else if (user["googleUserId"])
            updatedUserPromise = fetch(apiBaseUrl+'/google/user', options);
        else {
            reject(400);
        }

        updatedUserPromise
            .then(fetched => {
                let status = fetched.status;

                fetched.json()
                    .then(user => {
                        if(parseInt(status) === 200 && utilities.isUser(user))
                            resolve(user);
                        else//could be a 400, 401, 404
                            reject(status);

                    }).catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

module.exports = {tryGetUserInfo, createNewUser, updateUser};
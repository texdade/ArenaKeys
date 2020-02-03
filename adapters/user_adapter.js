const userCRUD = require('../db/user_data/user');

function getUser(id){
    return new Promise((resolve, reject) => {
        userCRUD.getUser(id).then(userData => {
            if(userData != undefined){
                let jsonUser = {
                    steamUserId: userData['steamUserId'],
                    googleUserId: userData["googleUserId"],
                    name: userData["name"],
                    imageLink: userData["imageLink"],
                    id: userData["id"], //internal id for our db
                    steamProfileUrl: userData["steamProfileUrl"],
                    email: userData["email"]
                }
                resolve(jsonUser);
            } else {
                reject("404");
            }
        }).catch(err => reject(err));
    });
}

function createUser(steamId, googleId, name, imageLink, steamProfileUrl, email){
    return new Promise((resolve, reject) => {
        userCRUD.createUser(steamId, googleId, name, imageLink, steamProfileUrl, email).then(userData => {
            if(userData != undefined){
                let id = {
                    id: userData
                }
                resolve(id);
            } else {
                reject("400");
            }
        }).catch(err => reject(err));
    });
}

function updateUser(steamId, googleId, name, imageLink, steamProfileUrl, email){
    return new Promise((resolve, reject) => {
        userCRUD.updateUser(steamId, googleId, name, imageLink, steamProfileUrl, email).then(function(){
            userCRUD.getUser(id).then(userData => {
                if(userData != undefined){
                    let jsonUser = {
                        steamUserId: userData['steamUserId'],
                        googleUserId: userData["googleUserId"],
                        name: userData["name"],
                        imageLink: userData["imageLink"],
                        id: userData["id"], //internal id for our db
                        steamProfileUrl: userData["steamProfileUrl"],
                        email: userData["email"]
                    }
                    resolve(jsonUser);
                } else {
                    reject("404");
                }
            }).catch(err => reject(err));
        }).catch(err => reject(err));
    });
}

function deleteUser(id){
    return new Promise((resolve, reject) => {
        userCRUD.deleteUser(id).then(function(){
            if(userData != undefined){
                resolve(id);
            } else {
                reject("400");
            }
        }).catch(err => reject(err));
    });
}

module.exports = {getUser, createUser};
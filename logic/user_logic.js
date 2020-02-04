const userHandler = require('../adapters/db_adapters/user_adapter');

function getUser(id){
    return new Promise((resolve, reject) => {
        userHandler.getUser(id).then(userData => {
            if(userData != undefined){
                resolve(userData);
            } else {
                reject("404");
            }
        }).catch(err => reject(err));
    });
}

function createUser(user){
    return new Promise((resolve, reject) => {
        userHandler.createUser(user).then(createdUser => {
            userId = createdUser["id"];

            if(userId != undefined){
                user["id"]=userId;
                resolve(user);
            } else {
                reject("400");
            }
        }).catch(err => reject(err));
    });
}

function updateUser(user){
    return new Promise((resolve, reject) => {
        userHandler.updateUser(user).then(userData => {
            resolve(userData);
        }).catch(err => reject(err));
    });
}

function deleteUser(id){
    return new Promise((resolve, reject) => {
        userHandler.deleteUser(id).then(userData => {
            if(userData != undefined){
                resolve(userData);
            } else {
                reject("400");
            }
        }).catch(err => reject(err));
    });
}

module.exports = {getUser, createUser, updateUser, deleteUser};
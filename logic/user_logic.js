const userHandler = require('../adapters/db_adapters/user_adapter');

function getUser(id){
    return new Promise((resolve, reject) => {
        userHandler.getUser(id).then(userData => {
            if(userData){
                resolve(userData);
            } else {
                reject(404);
            }
        }).catch(err => reject(err));
    });
}

function createUser(user){
    return new Promise((resolve, reject) => {
        userHandler.createUser(user).then(createdUser => {
            let userId = createdUser["id"];

            if(userId){
                user["id"] = userId;
                resolve(user);
            } else {
                reject(400);
            }
        }).catch(err => reject(err));
    });
}

function updateUser(user){
    return new Promise((resolve, reject) => {
        let searchingId;
        if(user['googleUserId'])
            searchingId = user['googleUserId'];
        if(user['steamUserId'])
            searchingId = user['steamUserId'];

        userHandler.getUser(searchingId).then(fetchedUserData => {
            if(fetchedUserData['id'] !== user['id'])
                reject(400);
            else{
                userHandler.updateUser(user).then(userData => {
                    resolve(userData);
                }).catch(err => reject(err));
            }

        }).catch(err => reject(err));

    });
}

function deleteUser(id){
    return new Promise((resolve, reject) => {
        userHandler.deleteUser(id).then(userData => {
            if(userData){
                resolve(userData);
            } else {
                reject(400);
            }
        }).catch(err => reject(err));
    });
}

module.exports = {getUser, createUser, updateUser, deleteUser};
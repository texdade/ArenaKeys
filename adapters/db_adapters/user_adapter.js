const userDAO = require('../../db/user');
const utilities = require('../../db/utilities');

function getUsers(){
    return new Promise((resolve, reject) => {
        userDAO.getUsers()
            .then(usersData => {
                if(usersData){
                    let users = [];
                    for(let userData of usersData)
                        users.push({
                            steamUserId: userData['steamUserId'],
                            googleUserId: userData["googleUserId"],
                            name: userData["name"],
                            imageLink: userData["imageLink"],
                            id: userData["id"], //internal id for our db
                            steamProfileUrl: userData["steamProfileUrl"],
                            email: userData["email"]
                        });
                    resolve(users);
                }else{
                    reject(400);
                }
            })
            .catch(err => reject(err));
    });
}

function getUser(userId){
    return new Promise((resolve, reject) => {
        userDAO.getUser(userId)
            .then(userData => {
                if(userData){
                    let jsonUser = {
                        steamUserId: userData['steamUserId'],
                        googleUserId: userData["googleUserId"],
                        name: userData["name"],
                        imageLink: userData["imageLink"],
                        id: userData["id"], //internal id for our db
                        steamProfileUrl: userData["steamProfileUrl"],
                        email: userData["email"]
                    };
                    resolve(jsonUser);
                }else{
                    reject(404);
                }
            })
            .catch(err => reject(err));
    });
}

function createUser(user){
    return new Promise((resolve, reject) => {
        if(utilities.isUserNoId(user)){
            userDAO.createUser(user['steamUserId'], user["googleUserId"], user["name"], user["imageLink"], user["steamProfileUrl"], user["email"])
                .then(userId => {
                    user["id"]=userId;
                    resolve(user);
                })
                .catch(err => reject(err));
        } else {
            reject(400);
        }
    });
}

function updateUser(user){
    return new Promise((resolve, reject) => {
        if(utilities.isUser(user)){
            userDAO.updateUser(user['steamUserId'], user["googleUserId"], user["name"], user["imageLink"], user["steamProfileUrl"], user["email"], user["id"])
                .then(updRows => {
                    if(updRows === 1)
                        resolve(user);
                    else
                        reject(404);
                })
                .catch(err => reject(err));
        } else {
            reject(400);
        }
    });
}

function deleteUser(userId){
    return new Promise((resolve, reject) => {
        getUser(userId).then(user => {
            if(user["googleUserId"])
                userId=user["googleUserId"]
            else if(user["steamUserId"])
                userId=user['steamUserId']
            else
                reject(404);
            
            userDAO.deleteUser(userId).then(dltRows => {
                if(dltRows === 1)
                    resolve(user);
                else
                    reject(404);
            }).catch(err => reject(err));
        });
    });
}

module.exports = {createUser, getUser, getUsers, updateUser, deleteUser};
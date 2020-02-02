const mysqlConnection = require('../utilities').connection;

function createList(userId, name, notify){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("INSERT INTO user_lists(user, name, notifyMe) VALUES(?,?,?)",
        [userId, name, notify],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while creating list for user " + userId);
                console.log(error);
                reject(new Error(error));
            }else{
                console.log("Created list for user "+ userId);
                resolve(results["insertId"]); //return the new list id
            }
        });
    });
}

//given a user, get all associated wishlists
function getLists(user){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT * FROM user_lists WHERE user = ?",
        [user],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while retrieving lists of user " + user);
                console.log(error);
                reject(new Error(error));
            }else{
                console.log("Retrieved lists of user " + user);
                resolve(results)
            }
        });
    });
}

//can only change name and notifier of a wishlist
function updateList(id, name, notifyMe){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("UPDATE user_lists SET name = ?, notifyMe = ? WHERE id = ?",
            [name, notifyMe, id],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while updating list "+ id);
                    console.log(error);
                    reject(new Error(error));
                }else{
                    console.log("Updated list "+ id);
                    resolve(null)
                }
            });
    });
}

function deleteList(id){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("DELETE FROM user_lists WHERE id = ?",
        [id],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while deleting list " + id);
                console.log(error);
                reject(new Error(error));
            }else{
                console.log("Deleted list " + id);
                resolve(null)
            }
        });
    });
}

function addGame(listId, steamId){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("INSERT INTO user_list_items(list_id, steam_id) VALUES(?,?)",
        [listId, steamId],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while creating entry for list "+ listId + " with game " + steamId);
                console.log(error);
                reject(new Error(error));
            }else{
                console.log("Created entry for list "+ listId + " with game " + steamId);
                resolve(null)
            }
        });
    });
}

function getGames(listId){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT steam_id FROM user_list_items WHERE list_id = ?",
        [listId],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while retrieving items for list " + listId);
                console.log(error);
                reject(new Error(error));
            }else{
                console.log("Retrieved items of list " + listId);
                resolve(results)
            }
        });
    });
}

function deleteGame(listId, steamId){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("DELETE FROM user_list_items WHERE list_id = ? AND steam_id = ?",
        [listId, steamId],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while deleting entry from list " + listId);
                console.log(error);
                reject(new Error(error));
            }else{
                console.log("Deleted entry from list " + listId);
                resolve(null)
            }
        });
    });
}

module.exports = {createList, getLists, updateList, deleteList, addGame, getGames, deleteGame}
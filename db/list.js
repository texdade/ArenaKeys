const mysqlConnection = require('./utilities').connection;

function createList(userId, name, notify){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("INSERT INTO user_lists(user, name, notify_me) VALUES(?,?,?)",
        [userId, name, notify],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while creating list for user " + userId);
                console.log(error);
                reject(error);
            }else{
                resolve(results["insertId"]);
            }
        });
    });
}

//given a user, get all associated wishlists
function getListsByUser(userId){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT id, name, notify_me, user as userId FROM user_lists WHERE user = ?",
        [userId],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while retrieving lists of user " + userId);
                console.log(error);
                reject(error);
            }else{
                resolve(results)
            }
        });
    });
}

//given a user, get all associated wishlists
function getList(listId, userId){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT id, name, notify_me, user as userId FROM user_lists WHERE id = ? AND user = ?",
            [listId, userId],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while retrieving lists of user " + userId);
                    console.log(error);
                    reject(error);
                }else{
                    resolve(results[0])
                }
            });
    });
}

//can only change name and notifier of a wishlist
function updateList(id, userId, name, notifyMe){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("UPDATE user_lists SET name = ?, notify_me = ? WHERE id = ? AND user = ?",
            [name, notifyMe, id, userId],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while updating list "+ id);
                    console.log(error);
                    reject(error);
                }else{
                    resolve(results.affectedRows)
                }
            });
    });
}

function deleteList(id, userId){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("DELETE FROM user_lists WHERE id = ? AND user = ?",
        [id, userId],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while deleting list " + id);
                console.log(error);
                reject(error);
            }else{
                resolve(results.affectedRows)
            }
        });
    });
}

function addGame(listId, steamId, notifyPrice){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("INSERT INTO user_list_items(list_id, steam_id, notify_price) VALUES(?,?,?)",
        [listId, steamId, notifyPrice],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while creating entry for list "+ listId + " with game " + steamId);
                console.log(error);
                reject(error);
            }else{
                resolve({
                    listId: listId,
                    steamID: steamId
                });
            }
        });
    });
}

function updGame(listId, steamId, notifyPrice){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("UPDATE user_list_items SET notify_price = ? WHERE list_id = ? AND steam_id = ?",
            [notifyPrice, listId, steamId],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while creating entry for list "+ listId + " with game " + steamId);
                    console.log(error);
                    reject(error);
                }else{
                    resolve({
                        listId: listId,
                        steamID: steamId
                    });
                }
            });
    });
}

function getGames(list){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT steam_id, notify_price FROM user_list_items WHERE list_id = ?",
        [list['id']],
        (error, results, fields) =>{
            if(error) {
                console.log("ERROR while retrieving items for list " + list['id']);
                console.log(error);
                reject(error);
            }else{
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
                reject(error);
            }else{
                resolve(results.affectedRows)
            }
        });
    });
}

module.exports = {createList, getListsByUser, getList, updateList, deleteList, addGame, updGame, getGames, deleteGame};
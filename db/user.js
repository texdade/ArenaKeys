const mysqlConnection = require('./utilities').connection;

function createUser(steamUserId, googleUserId, name, imageLink, steamProfileUrl, email){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("INSERT INTO users(steamUserId, googleUserId, name, imageLink, steamProfileUrl, email) VALUES(?,?,?,?,?,?)",
            [steamUserId, googleUserId, name, imageLink, steamProfileUrl, email],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while inserting new user");
                    console.log(error);
                    reject(new Error(error));
                }else{
                    resolve(results["insertId"]);
                }
            });
    });
}

//return all users infos
function getUsers(){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT * FROM users",
            [],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while retrieving users");
                    console.log(error);
                    reject(new Error(error));
                }else{
                    resolve(results);
                }
            });
    });
}

//return user infos taking either steam id or google id
function getUser(id){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT * FROM users WHERE steamUserId = ? OR googleUserId = ?",
            [id, id],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while retrieving user with id " + id);
                    console.log(error);
                    reject(new Error(error));
                }else{
                    resolve(results[0]);
                }
            });
    });
}

function updateUser(steamUserId, googleUserId, name, imageLink, steamProfileUrl, email, id){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("UPDATE users SET steamUserId = ?, googleUserId = ?, name = ?, imageLink = ?, steamProfileUrl = ?, email = ? WHERE (steamUserId = ? OR googleUserId = ?) AND id = ?",
            [steamUserId, googleUserId, name, imageLink, steamProfileUrl, email, steamUserId, googleUserId, id],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while updating user");
                    console.log(error);
                    reject(new Error(error));
                }else{
                    resolve(results.affectedRows);
                }
            });
    });
}

function deleteUser(id){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("DELETE FROM users WHERE steamUserId = ? OR googleUserId = ?",
            [id, id],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while deleting user");
                    console.log(error);
                    reject(new Error(error));
                }else{
                    resolve(results.affectedRows)
                }
            });
    });
}

module.exports = {createUser, getUser, getUsers, updateUser, deleteUser};
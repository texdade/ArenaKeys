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
                    console.log("Inserted new user ");
                    resolve(results["insertId"]);
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
                    console.log("Retrieved user with id: " + id);
                    resolve(results[0])
                }
            });
    });
}

function updateUser(steamUserId, googleUserId, name, imageLink, steamProfileUrl, email){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("UPDATE users SET steamUserId = ?, googleUserId = ?, name = ?, imageLink = ?, steamProfileUrl = ?, email = ? WHERE steamUserId = ? OR googleUserId = ?",
            [steamUserId, googleUserId, name, imageLink, steamProfileUrl, email, steamUserId, googleUserId],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while updating user");
                    console.log(error);
                    reject(new Error(error));
                }else{
                    console.log("Updated user");
                    resolve(null)
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
                    console.log("Deleted user");
                    resolve(null)
                }
            });
    });
}

module.exports = {createUser, getUser, updateUser, deleteUser};
const mysqlConnection = require('../utilities').connection;
const bcrypt = require('bcrypt');

function createUser(email, nickname, password, user_steam_id, age, country){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("INSERT INTO users(email, nickname, password, user_steam_id, age, country) VALUES(?,?,?,?,?,?)",
            //password is already hashed with salt via bcrypt
            [email, nickname, bcrypt.hashSync(password, 10), user_steam_id, age, country],
            (error, results, fields) =>{

                if(error) {
                    console.log("ERROR while inserting user "+ nickname + " with email " + email);
                    console.log(error);
                    reject(new Error(error));
                }else{
                    console.log("Inserted user "+ nickname + " with email " + email);
                    resolve(null)
                }
            });
    });
}

function getUser(email){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("SELECT * FROM users WHERE email = ?",
            [email],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while retrieving user with email " + email);
                    console.log(error);
                    reject(new Error(error));
                }else{
                    console.log("Retrieved user with email: " + email);
                    resolve(results[0])
                }
            });
    });
}

//can update everything besides password
function updateUserData(email, nickname, user_steam_id, age, country){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("UPDATE users SET email = ?, nickname = ?, user_steam_id = ?, age = ?, country = ? WHERE email = ?",
            [email, nickname, user_steam_id, age, country, email],
            (error, results, fields) =>{

                if(error) {
                    console.log("ERROR while updating user "+ nickname + " with email " + email);
                    console.log(error);
                    reject(new Error(error));
                }else{
                    console.log("Updated user "+ nickname + " with email " + email);
                    resolve(null)
                }
            });
    });
}

function updateUserPassword(email, password){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("UPDATE users SET password = ? WHERE email = ?",
            [bcrypt.hashSync(password, 10), email],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while updating user " + email + " password");
                    console.log(error);
                    reject(new Error(error));
                }else{
                    console.log("Updated user " + email + " password");
                    resolve(null)
                }
            });
    });
}



function deleteUser(email){
    return new Promise((resolve, reject) => {
        mysqlConnection.query("DELETE FROM users WHERE email = ?",
            [email],
            (error, results, fields) =>{
                if(error) {
                    console.log("ERROR while deleting user with email " + email);
                    console.log(error);
                    reject(new Error(error));
                }else{
                    console.log("Deleted user with email " + email);
                    resolve(null)
                }
            });
    });
}

module.exports = {createUser, getUser, updateUserData, updateUserPassword, deleteUser}
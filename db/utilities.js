//db connection
const mysql = require('mysql');
let connection = mysql.createConnection({
        host: 'remotemysql.com',
        user: 'bmjNX6on7f',
        password: '2mwKzl3a96',
        database: 'bmjNX6on7f'
    });

function logUpdateTable(tableName){
    return new Promise((resolve, reject) => {

        connection.query("UPDATE last_update SET dt_update = NOW() WHERE t_name = ?)",
            [tableName],
            (error, results, fields) =>{
                if(error) {
                    reject(error);
                }else{
                    resolve(null);
                }

            });
    });
}

module.exports = {connection, logUpdateTable};
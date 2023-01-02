const mysql = require("mysql2");
const { DB_USER, DB_PASSWORD, DB_HOST, DB } = require("./shared.js");

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    database: DB,
    password: DB_PASSWORD,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
});


module.exports = pool;
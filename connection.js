const mysql = require("mysql2");
const { DB_USER, DB_PASSWORD, DB_HOST, DB } = require("./settings/shared.js");

const connection = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    database: DB,
    password: DB_PASSWORD,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
});


exports.connection = connection;
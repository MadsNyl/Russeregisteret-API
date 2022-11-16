const mysql = require("mysql2");
require("dotenv").config();
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB = process.env.DB;

const connection = mysql.createPool({
    connectionLimit: 5,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB,
    multipleStatements: true
});

exports.connection = connection;
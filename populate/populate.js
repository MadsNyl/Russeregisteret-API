const reader = require("xlsx");
const mysql = require("mysql2");
require("dotenv").config();
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB = process.env.DB;

const pool = mysql.createConnection({
    connectionLimit: 5,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB,
    multipleStatements: true
});

let values = [];
const file = reader.readFile("populate/Russenavn.xlsx");

let temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
temp.forEach((res) => {
    values.push(res)
});

values.forEach((reg) => { delete reg.Sammen });
values.filter(reg => !(reg && Object.keys(reg).length === 0));

let i = 0;
for (let val of values) {
    if(Object.keys(val).length === 0) values.splice(i, i);
    i++;
}


const populate = (name, year) => {
    pool.query(`INSERT INTO register (name, year) VALUES ("${name}", "${year}")`, (error, results) => {
        if (error) console.log(error);
        else console.log("Rows inserted");
    });
}


for (const val of values) {
    populate(val.Navn, val.År);
}
console.log("finito")
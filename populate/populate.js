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
values = values.filter(reg => !(reg && Object.keys(reg).length === 0));

let finalValues = [];

for (let val of values) finalValues.push([val["Navn"], val["År"]]);


const populate = (values) => {
    console.log(values)
    pool.query("INSERT INTO register (name, year) VALUES ?", [values], (error, results) => {
        console.log(results)
        if (error) console.log(error);
        else console.log("Rows inserted");
    });
}

const deleteAll = () => {
    pool.query("TRUNCATE register", (error, results) => {
        if (error) console.log(error);
        else console.log("All records deleted.")
    });
}


for (let i = 0; i < finalValues.length; i++) {
    pool.query("SELECT * FROM register WHERE name = ? AND year = ?", [finalValues[i][0], finalValues[i][1]], (error, results) => {
        if (error) console.log(error);
        else if (results.length > 0) {
            console.log(`${finalValues[i][0]} ${finalValues[i][1]} is already registered.`);
            finalValues.splice(i, 1);
        }
    });
}

// populate(finalValues);

console.log("finito");
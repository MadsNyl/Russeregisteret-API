const reader = require("xlsx");
const mysql = require("mysql2");

const pool = mysql.createConnection({
    connectionLimit: 5,
    host: "mysql-ait.stud.idi.ntnu.no",
    user: "mknylund",
    password: "Rm2.II4DW",
    database: "mknylund",
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
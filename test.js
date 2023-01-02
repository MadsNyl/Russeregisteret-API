const connection = require("./connection.js");
const pool = connection.connection;

pool.getConnection(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });


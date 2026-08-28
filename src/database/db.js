const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Correct absolute path based on the folder where db.js lives
const dbPath = path.join(__dirname, "egtransfer.db");
const schemaPath = path.join(__dirname, "schema.sql");

const db = new sqlite3.Database(dbPath);

// Load schema safely
const schema = fs.readFileSync(schemaPath, "utf8");
db.exec(schema);

module.exports = db;

const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Safe persistent path for Render FREE
const dbPath = path.join(process.cwd(), "egtransfer.db");
const schemaPath = path.join(__dirname, "schema.sql");

console.log("DB PATH:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("DB OPEN ERROR:", err);
    }
});

// Load schema ONLY if DB is empty
if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
    console.log("Loading schema...");
    const schema = fs.readFileSync(schemaPath, "utf8");
    db.exec(schema);
}

module.exports = db;

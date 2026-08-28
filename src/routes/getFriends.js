const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.post("/", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.json({ status: "error", error: "Missing username" });
    }

    const sql = `
        SELECT u.id, u.username, u.email, u.friendcode
        FROM friends f
        JOIN users u ON u.username = f.friend
        WHERE f.owner = ?
    `;

    db.all(sql, [username], (err, rows) => {
        if (err) {
            return res.json({ status: "error", error: err });
        }

        return res.json({
            status: "ok",
            friends: rows
        });
    });
});

module.exports = router;

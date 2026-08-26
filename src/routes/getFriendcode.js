const express = require("express");
const router = express.Router();
const db = require("../../database/db");

router.post("/", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.json({ status: "error", error: "Missing username" });
    }

    db.get(
        "SELECT friendcode FROM users WHERE username = ?",
        [username],
        (err, row) => {
            if (err || !row) {
                return res.json({ status: "error", error: "User not found" });
            }

            return res.json({
                status: "ok",
                friendcode: row.friendcode
            });
        }
    );
});

module.exports = router;

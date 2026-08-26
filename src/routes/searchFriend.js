const express = require("express");
const router = express.Router();
const db = require('../../database/db');

router.post("/", (req, res) => {
    const { friendcode } = req.body;

    db.get("SELECT id, username FROM users WHERE friendcode = ?", [friendcode], (err, user) => {
        if (!user) return res.json({ found: false, message: "No results" });

        res.json({
            found: true,
            userid: user.id,
            username: user.username
        });
    });
});

module.exports = router;

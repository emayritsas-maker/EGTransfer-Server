const express = require("express");
const router = express.Router();
const db = require('../../database/db');
const { comparePassword } = require("../utils/hashPassword");

router.post("/", (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (!user) return res.json({ status: "error", message: "User not found" });

        const match = await comparePassword(password, user.passwordHash);
        if (!match) return res.json({ status: "error", message: "Wrong password" });

        res.json({
            status: "ok",
            userid: user.id,
            username: user.username,
            friendcode: user.friendcode
        });
    });
});

module.exports = router;

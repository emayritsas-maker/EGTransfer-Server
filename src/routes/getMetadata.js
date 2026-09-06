const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.post("/", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.json({ status: "error", error: "Missing username" });
    }

    db.get(
        "SELECT id, username, email, friendcode, lastLogin, ip, isVerified FROM users WHERE username = ?",
        [username],
        (err, user) => {
            if (err || !user) {
                return res.json({ status: "error", error: "User not found" });
            }

            return res.json({
                status: "ok",

                // 🔥 EXACT KEYS THAT ENGINEER.CS EXPECTS
                Username: user.username,
                Email: user.email,
                FriendCode: user.friendcode,
                LastLogin: user.lastLogin,
                LastIP: user.ip
            });
        }
    );
});

module.exports = router;

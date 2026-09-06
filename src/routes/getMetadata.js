const express = require("express");
const router = express.Router();
const db = require("../database/db");

// 🔥 GET + POST SUPPORT
router.all("/", (req, res) => {
    const username = req.body.username || req.query.username;

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
                username: user.username,
                email: user.email,
                friendcode: user.friendcode,
                lastLogin: user.lastLogin,
                ip: user.ip
            });
        }
    );
});

module.exports = router;

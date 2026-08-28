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
                id: user.id,
                username: user.username,
                email: user.email,
                friendcode: user.friendcode,
                lastLogin: user.lastLogin,
                ip: user.ip,
                isVerified: user.isVerified
            });
        }
    );
});

module.exports = router;

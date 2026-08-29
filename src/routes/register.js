const express = require("express");
const router = express.Router();
const db = require('../database/db');
const generateFriendCode = require("../utils/generateFriendCode");
const { hashPassword } = require("../utils/hashPassword");

router.get("/", async (req, res) => {
    const { username, email, password, ip } = req.query;

    if (!username || !email || !password || !ip) {
        return res.json({ status: "error", error: "Missing fields" });
    }

    const friendcode = generateFriendCode();
    const hashed = await hashPassword(password);
    const lastLogin = new Date().toISOString();
    const isVerified = 1;
    const verificationCode = null;

    db.run(
        `INSERT INTO users 
        (username, email, passwordHash, friendcode, lastLogin, ip, isVerified, verificationCode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, hashed, friendcode, lastLogin, ip, isVerified, verificationCode],
        function (err) {
            if (err) return res.json({ status: "error", error: err });

            res.json({
                status: "ok",
                id: this.lastID,
                username,
                email,
                friendcode,
                lastLogin,
                ip
            });
        }
    );
});

module.exports = router;

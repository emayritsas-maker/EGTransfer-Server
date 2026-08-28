const express = require("express");
const router = express.Router();
const db = require("../database/db");
const sendEmail = require("../email/sendEmail");

router.post("/", async (req, res) => {
    const { username, newIP } = req.body;

    if (!username || !newIP) {
        return res.json({ status: "error", error: "Missing fields" });
    }

    db.get("SELECT email FROM users WHERE username = ?", [username], async (err, user) => {
        if (err || !user) {
            return res.json({ status: "error", error: "User not found" });
        }

        const link = `https://egtransfer.com/confirm-ip?user=${username}&ip=${newIP}`;

        await sendEmail(
            user.email,
            "Confirm your new IP address",
            `<h1>IP Change Detected</h1>
             <p>We detected a login attempt from a new IP address:</p>
             <b>${newIP}</b>
             <p>If this is you, click below to confirm:</p>
             <a href="${link}">Confirm IP</a>`
        );

        res.json({ status: "ok" });
    });
});

module.exports = router;

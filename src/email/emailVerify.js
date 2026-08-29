const express = require("express");
const router = express.Router();
const db = require("../database/db");
const sendEmail = require("../email/sendEmail");

router.post("/", async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.json({ status: "error", error: "Missing username" });
    }

    db.get("SELECT email, verificationCode FROM users WHERE username = ?", [username], async (err, user) => {
        if (err || !user) {
            return res.json({ status: "error", error: "User not found" });
        }

        const link = `https://egtransfer.com/verify?code=${user.verificationCode}`;

        await sendEmail(
            user.email,
            "Verify your EGTransfer account",
            `<h1>Welcome to EGTransfer</h1>
             <p>Click the link below to verify your account:</p>
             <a href="${link}">Verify Account</a>`
        );

        res.json({ status: "ok" });
    });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../../database/db");
const crypto = require("crypto");
const sendEmail = require("../email/sendEmail");

router.post("/", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ status: "error", error: "Missing email" });
    }

    db.get("SELECT username FROM users WHERE email = ?", [email], async (err, user) => {
        if (err || !user) {
            return res.json({ status: "error", error: "Email not found" });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");
        const expire = Date.now() + 1000 * 60 * 15; // 15 minutes

        db.run(
            "UPDATE users SET resetToken = ?, resetTokenExpire = ? WHERE email = ?",
            [token, expire, email]
        );

        const link = `https://egtransfer.com/reset?token=${token}`;

        await sendEmail(
            email,
            "Reset your EGTransfer password",
            `<h1>Password Reset</h1>
             <p>Click the link below to reset your password:</p>
             <a href="${link}">Reset Password</a>
             <p>This link expires in 15 minutes.</p>`
        );

        return res.json({ status: "ok", message: "Reset email sent" });
    });
});

module.exports = router;

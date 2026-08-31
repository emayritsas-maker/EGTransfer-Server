const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.post("/", (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.json({ status: "error", error: "Missing verification code" });
    }

    // Πραγματική IP
    const xf = req.headers['x-forwarded-for'] ||
               req.headers['cf-connecting-ip'] ||
               req.headers['true-client-ip'] ||
               req.socket.remoteAddress || '';

    const clientIp = String(xf).split(',')[0].trim();

    db.get(
        "SELECT id FROM users WHERE verificationCode = ?",
        [code],
        (err, row) => {
            if (err) {
                return res.json({ status: "error", error: "Database error" });
            }

            if (!row) {
                return res.json({ status: "error", error: "Invalid or expired code" });
            }

            const now = new Date().toISOString();

            db.run(
                "UPDATE users SET isVerified = 1, verificationCode = '', lastLogin = ?, ip = ? WHERE id = ?",
                [now, clientIp, row.id],
                (err2) => {
                    if (err2) {
                        return res.json({ status: "error", error: "Error updating verification" });
                    }

                    res.json({ status: "ok", ip: clientIp });
                }
            );
        }
    );
});

module.exports = router;

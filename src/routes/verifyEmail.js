// src/routes/verifyEmail.js
const express = require("express");
const router = express.Router();
const db = require("../database/db");

// Optional: small helper for logging
function log(...args) { console.log(new Date().toISOString(), ...args); }

router.post("/", (req, res) => {
    const { code } = req.body;

    if (!code || typeof code !== "string" || code.length < 6 || code.length > 64) {
        return res.status(400).json({ status: "error", error: "Missing or invalid verification code" });
    }

    // Get client IP (trust proxy should be enabled in server.js)
    const xf = req.headers['x-forwarded-for'] || req.headers['cf-connecting-ip'] || req.headers['true-client-ip'] || req.socket.remoteAddress || '';
    const clientIp = String(xf).split(',')[0].trim();

    // Find user by code and check expiry / isVerified
    db.get(
        "SELECT id, isVerified, verificationCode, verificationExpire FROM users WHERE verificationCode = ?",
        [code],
        (err, row) => {
            if (err) {
                log("verifyEmail select error:", err);
                return res.status(500).json({ status: "error", error: "Database error" });
            }

            if (!row) {
                return res.status(404).json({ status: "error", error: "Invalid or expired code" });
            }

            // If already verified, return ok but do not change anything
            if (row.isVerified === 1) {
                log("verifyEmail: already verified userId", row.id);
                return res.json({ status: "ok", note: "already_verified" });
            }

            // If verificationExpire exists, check it
            if (row.verificationExpire) {
                try {
                    const expireTs = new Date(row.verificationExpire).getTime();
                    if (Date.now() > expireTs) {
                        return res.status(410).json({ status: "error", error: "Verification code expired" });
                    }
                } catch (e) {
                    // ignore parse errors and proceed
                }
            }

            const now = new Date().toISOString();

            // Update user: set verified, clear code and expire, update lastLogin and ip
            db.run(
                "UPDATE users SET isVerified = 1, verificationCode = '', verificationExpire = NULL, lastLogin = ?, ip = ? WHERE id = ?",
                [now, clientIp, row.id],
                function (err2) {
                    if (err2) {
                        log("verifyEmail update error:", err2);
                        return res.status(500).json({ status: "error", error: "Error updating verification" });
                    }

                    log("verifyEmail success userId", row.id, "ip", clientIp);
                    // Minimal response — do not leak other user data
                    return res.json({ status: "ok", ip: clientIp });
                }
            );
        }
    );
});

module.exports = router;

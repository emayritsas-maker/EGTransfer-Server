const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.post("/", (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.json({
            status: "error",
            error: "Missing verification code"
        });
    }

    db.get("SELECT * FROM users WHERE verificationCode = ?", [code], (err, user) => {
        if (err) {
            console.error("DB ERROR (verifyEmailFromExe):", err);
            return res.json({
                status: "error",
                error: "Database error"
            });
        }

        if (!user) {
            return res.json({
                status: "error",
                error: "Invalid or expired verification code"
            });
        }

        db.run(
            "UPDATE users SET isVerified = 1, verificationCode = '' WHERE id = ?",
            [user.id],
            updateErr => {
                if (updateErr) {
                    console.error("DB UPDATE ERROR:", updateErr);
                    return res.json({
                        status: "error",
                        error: "Database update failed"
                    });
                }

                return res.json({
                    status: "ok",
                    message: "Email verified successfully"
                });
            }
        );
    });
});

module.exports = router;

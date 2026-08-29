const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.get("/", (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.send("Missing verification code.");
    }

    db.get(
        "SELECT id FROM users WHERE verificationCode = ?",
        [code],
        (err, row) => {
            if (err) {
                return res.send("Database error.");
            }

            if (!row) {
                return res.send("Invalid or expired verification code.");
            }

            // Mark user as verified
            db.run(
                "UPDATE users SET isVerified = 1, verificationCode = '' WHERE id = ?",
                [row.id],
                (err2) => {
                    if (err2) {
                        return res.send("Error verifying account.");
                    }

                    res.send(`
                        <h2>Account Verified!</h2>
                        <p>You can now use the EGTransfer app.</p>
                    `);
                }
            );
        }
    );
});

module.exports = router;

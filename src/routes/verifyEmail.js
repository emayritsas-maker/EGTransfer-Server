const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.post("/", (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.json({ status: "error", error: "Missing verification code" });
    }

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

            db.run(
                "UPDATE users SET isVerified = 1, verificationCode = '' WHERE id = ?",
                [row.id],
                (err2) => {
                    if (err2) {
                        return res.json({ status: "error", error: "Error updating verification" });
                    }

                    res.json({ status: "ok" });
                }
            );
        }
    );
});

module.exports = router;

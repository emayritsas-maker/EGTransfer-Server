const express = require("express");
const router = express.Router();
const db = require("../../database/db");
const { hashPassword } = require("../utils/hashPassword");

router.post("/", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.json({ status: "error", error: "Missing fields" });
    }

    db.get(
        "SELECT username, resetTokenExpire FROM users WHERE resetToken = ?",
        [token],
        async (err, user) => {
            if (err || !user) {
                return res.json({ status: "error", error: "Invalid token" });
            }

            if (Date.now() > user.resetTokenExpire) {
                return res.json({ status: "error", error: "Token expired" });
            }

            const hashed = await hashPassword(newPassword);

            db.run(
                "UPDATE users SET passwordHash = ?, resetToken = NULL, resetTokenExpire = NULL WHERE resetToken = ?",
                [hashed, token]
            );

            return res.json({ status: "ok", message: "Password updated" });
        }
    );
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../../database/db");

router.post("/", (req, res) => {
    const { username, newLastLogin, newIP } = req.body;

    if (!username || !newLastLogin || !newIP) {
        return res.json({ status: "error", error: "Missing fields" });
    }

    db.run(
        "UPDATE users SET lastLogin = ?, ip = ? WHERE username = ?",
        [newLastLogin, newIP, username],
        function (err) {
            if (err) {
                return res.json({ status: "error", error: err });
            }

            return res.json({
                status: "ok",
                updatedLastLogin: newLastLogin,
                updatedIP: newIP
            });
        }
    );
});

module.exports = router;

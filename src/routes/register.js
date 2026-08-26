const express = require("express");
const router = express.Router();
const db = require("../database/db");
const generateFriendCode = require("../utils/generateFriendCode");
const { hashPassword } = require("../utils/hashPassword");

router.post("/", async (req, res) => {
    const { username, email, password } = req.body;

    const friendcode = generateFriendCode();
    const hashed = await hashPassword(password);

    db.run(
        "INSERT INTO users (username, email, passwordHash, friendcode) VALUES (?, ?, ?, ?)",
        [username, email, hashed, friendcode],
        function (err) {
            if (err) return res.json({ status: "error", error: err });

            res.json({
                status: "ok",
                friendcode: friendcode
            });
        }
    );
});

module.exports = router;

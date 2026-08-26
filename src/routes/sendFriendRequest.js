const express = require("express");
const router = express.Router();
const db = require("../database/db");
const sendEmail = require("../email/sendEmail");

router.post("/", (req, res) => {
    const { from, to } = req.body;

    db.run(
        "INSERT INTO friend_requests (fromUserId, toUserId, status) VALUES (?, ?, 'pending')",
        [from, to],
        async function (err) {
            if (err) return res.json({ status: "error", error: err });

            db.get("SELECT email FROM users WHERE id = ?", [to], async (err, user) => {
                if (user) {
                    await sendEmail(
                        user.email,
                        "EGTransfer Friend Request",
                        "You have a new friend request!"
                    );
                }
            });

            res.json({ status: "ok" });
        }
    );
});

module.exports = router;

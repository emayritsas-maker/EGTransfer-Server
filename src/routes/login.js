const express = require("express");
const router = express.Router();
const db = require("../../database/db");
const { comparePassword } = require("../utils/hashPassword");

router.post("/", async (req, res) => {
    const { username, password, localLastLogin, localIP } = req.body;

    if (!username || !password || !localLastLogin || !localIP) {
        return res.json({ status: "error", error: "Missing fields" });
    }

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {
            if (err || !user) {
                return res.json({ status: "error", error: "User not found" });
            }

            const passwordMatch = await comparePassword(password, user.passwordHash);
            if (!passwordMatch) {
                return res.json({ status: "error", error: "Wrong password" });
            }

            // === METADATA CHECK ===

            const serverLastLogin = user.lastLogin;
            const serverIP = user.ip;

            const onlyIPChanged =
                localLastLogin === serverLastLogin &&
                localIP !== serverIP;

            const lastLoginChanged =
                localLastLogin !== serverLastLogin &&
                localIP === serverIP;

            const multipleChanged =
                localLastLogin !== serverLastLogin &&
                localIP !== serverIP;

            // CASE 1: ONLY IP CHANGED → EMAIL CONFIRM
            if (onlyIPChanged) {
                return res.json({
                    status: "ip_change",
                    message: "We sent you an email to confirm your new IP.",
                    email: user.email
                });
            }

            // CASE 2: LAST LOGIN CHANGED → UPDATE SERVER
            if (lastLoginChanged) {
                const newLogin = new Date().toISOString();
                db.run(
                    "UPDATE users SET lastLogin = ?, ip = ? WHERE id = ?",
                    [newLogin, localIP, user.id]
                );

                return res.json({
                    status: "ok",
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    friendcode: user.friendcode,
                    lastLogin: newLogin,
                    ip: localIP
                });
            }

            // CASE 3: MULTIPLE METADATA CHANGED → FORCED LOGIN
            if (multipleChanged) {
                return res.json({
                    status: "force_login",
                    error: "Metadata mismatch. Please login again."
                });
            }

            // CASE 4: EVERYTHING MATCHES → NORMAL LOGIN
            const newLogin = new Date().toISOString();
            db.run(
                "UPDATE users SET lastLogin = ?, ip = ? WHERE id = ?",
                [newLogin, localIP, user.id]
            );

            return res.json({
                status: "ok",
                id: user.id,
                username: user.username,
                email: user.email,
                friendcode: user.friendcode,
                lastLogin: newLogin,
                ip: localIP
            });
        }
    );
});

module.exports = router;

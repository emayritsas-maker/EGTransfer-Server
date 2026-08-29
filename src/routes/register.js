const express = require("express");
const router = express.Router();
const db = require("../database/db");
const bcrypt = require("bcrypt");
const sendVerificationEmail = require("../email/emailVerify");

// Generate random verification code
function generateVerificationCode() {
    return Math.random().toString(36).substring(2, 10);
}

router.post("/", async (req, res) => {
    const { username, email, password, ip } = req.body;

    if (!username || !email || !password) {
        return res.json({ status: "error", message: "Missing fields" });
    }

    try {
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        db.run(
            `INSERT INTO users 
            (username, email, passwordHash, friendcode, lastLogin, ip, isVerified, verificationCode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username,
                email,
                passwordHash,
                "FRIEND" + Math.random().toString(36).substring(2, 8).toUpperCase(),
                new Date().toISOString(),
                ip || "0.0.0.0",
                0, // not verified yet
                "" // will update below
            ],
            async function (err) {
                if (err) {
                    return res.json({
                        status: "error",
                        error: err
                    });
                }

                const userId = this.lastID;
                const verificationCode = generateVerificationCode();

                // Save verification code
                db.run(
                    "UPDATE users SET verificationCode = ? WHERE id = ?",
                    [verificationCode, userId],
                    async function (err2) {
                        if (err2) {
                            return res.json({
                                status: "error",
                                error: err2
                            });
                        }

                        // Send verification email
                        await sendVerificationEmail(email, verificationCode);

                        // Tell the EXE to wait for verification
                        res.json({
                            status: "waiting_verification",
                            message: "Check your email to verify your account."
                        });
                    }
                );
            }
        );
    } catch (e) {
        res.json({ status: "error", error: e });
    }
});

module.exports = router;

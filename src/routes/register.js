const express = require("express");
const router = express.Router();
const db = require("../database/db");
const bcrypt = require("bcrypt");
const sendVerificationEmail = require("../email/emailVerify");

// Generate TM friendcode
function generateFriendcodeTM() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const symbols = "!@#$%^&*()-_=+[]{}<>?";
  const digits = "0123456789";

  function pick(str) {
    return str[Math.floor(Math.random() * str.length)];
  }

  let code = "TM";

  code += pick(upper);
  code += pick(upper);

  code += pick(lower);
  code += pick(lower);

  code += pick(symbols);
  code += pick(symbols);

  code += pick(digits);
  code += pick(digits);

  return code; // 10 chars total
}

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
        const passwordHash = await bcrypt.hash(password, 10);

        // USE TM FRIENDCODE HERE
        const friendcode = generateFriendcodeTM();

        const verificationCode = generateVerificationCode();
        const now = new Date().toISOString();

        db.run(
            `INSERT INTO users 
            (username, email, passwordHash, friendcode, lastLogin, ip, isVerified, verificationCode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username,
                email,
                passwordHash,
                friendcode,
                now,
                ip || "0.0.0.0",
                0,
                verificationCode
            ],
            async function (err) {
                if (err) {
                    console.log("DB error:", err);
                    return res.json({
                        status: "error",
                        error: err.code || err.message
                    });
                }

                try {
                    await sendVerificationEmail(email, verificationCode);
                } catch (emailErr) {
                    console.error("Email error:", emailErr);
                }

                return res.json({
                    status: "waiting_verification",
                    message: "Check your email to verify your account."
                });
            }
        );
    } catch (e) {
        res.json({ status: "error", error: e.message });
    }
});

module.exports = router;

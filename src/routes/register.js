const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const db = require(path.join(__dirname, "..", "database", "db"));

let sendVerificationEmail = null;
try {
  sendVerificationEmail = require(path.join(__dirname, "..", "email", "sendEmail"));
} catch (e) {
  console.warn("sendEmail module not found; verification emails will be logged instead.");
}

router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res.json({ status: "error", error: "Missing username, email or password" });
    }

    const emailNormalized = String(email).trim().toLowerCase();
    const usernameNormalized = String(username).trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      return res.json({ status: "error", error: "Invalid email" });
    }

    db.get("SELECT id FROM users WHERE email = ?", [emailNormalized], async (err, row) => {
      if (err) {
        console.error("DB SELECT ERROR (register):", err);
        return res.json({ status: "error", error: "Database error" });
      }
      if (row) {
        return res.json({ status: "error", error: "User already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const verificationCode = crypto.randomBytes(16).toString("hex");

      const stmt = db.prepare(
        "INSERT INTO users (username, email, passwordHash, verificationCode, isVerified, lastLogin, ip) VALUES (?, ?, ?, ?, 0, '', '')"
      );

      stmt.run([usernameNormalized, emailNormalized, passwordHash, verificationCode], function (insertErr) {
        if (insertErr) {
          console.error("DB INSERT ERROR (register):", insertErr);
          return res.json({ status: "error", error: "Database error" });
        }

        const userId = this.lastID;

        const payload = {
          to: emailNormalized,
          code: verificationCode,
          userId
        };

        if (typeof sendVerificationEmail === "function") {
          try {
            const maybePromise = sendVerificationEmail(payload);
            if (maybePromise && typeof maybePromise.then === "function") {
              maybePromise.catch(e => console.error("sendVerificationEmail failed:", e));
            }
          } catch (e) {
            console.error("sendVerificationEmail threw:", e);
          }
        } else {
          console.log("VERIFICATION CODE (no mailer):", payload);
        }

        return res.json({
          status: "waiting_verification",
          message: "Check your email to verify your account."
        });
      });

      stmt.finalize();
    });
  } catch (e) {
    console.error("REGISTER ROUTE ERROR:", e);
    return res.json({ status: "error", error: "Server error" });
  }
});

module.exports = router;

// src/routes/register.js
const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Σταθερό require προς τη βάση (ασφαλές ανεξαρτήτως cwd)
const db = require(path.join(__dirname, "..", "database", "db"));

// Προαιρετικό: αν έχεις module για αποστολή email, προσπάθησε να το φορτώσεις χωρίς να σπάει αν λείπει
let sendVerificationEmail = null;
try {
  sendVerificationEmail = require(path.join(__dirname, "..", "email", "sendEmail"));
} catch (e) {
  console.warn("sendEmail module not found; verification emails will be logged instead.");
}

/**
 * POST /register
 * Σώμα: { email, password }
 * Δημιουργεί χρήστη με hashed password και verificationCode.
 */
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    // Απλός validation email
    const emailNormalized = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    // Έλεγχος αν υπάρχει ήδη χρήστης
    db.get("SELECT id FROM users WHERE email = ?", [emailNormalized], async (err, row) => {
      if (err) {
        console.error("DB SELECT ERROR (register):", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (row) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Δημιούργησε verification code
      const verificationCode = crypto.randomBytes(16).toString("hex");

      // Εισαγωγή χρήστη
      const stmt = db.prepare(
        "INSERT INTO users (email, password_hash, verificationCode, isVerified, createdAt) VALUES (?, ?, ?, 0, ?)"
      );
      const now = new Date().toISOString();
      stmt.run([emailNormalized, passwordHash, verificationCode, now], function (insertErr) {
        if (insertErr) {
          console.error("DB INSERT ERROR (register):", insertErr);
          return res.status(500).json({ error: "Database error" });
        }

        const userId = this.lastID;

        // Στείλε verification email (αν υπάρχει module), αλλιώς log
        const verificationPayload = {
          to: emailNormalized,
          code: verificationCode,
          userId
        };

        if (typeof sendVerificationEmail === "function") {
          try {
            const maybePromise = sendVerificationEmail(verificationPayload);
            if (maybePromise && typeof maybePromise.then === "function") {
              maybePromise.catch(e => console.error("sendVerificationEmail failed:", e));
            }
          } catch (e) {
            console.error("sendVerificationEmail threw:", e);
          }
        } else {
          console.log("VERIFICATION CODE (no mailer):", verificationPayload);
        }

        return res.status(201).json({ message: "Registered", id: userId });
      });
      stmt.finalize();
    });
  } catch (e) {
    console.error("REGISTER ROUTE ERROR:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

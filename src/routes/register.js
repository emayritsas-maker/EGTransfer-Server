// server.js
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Load DB
require("./database/db");

/* -------------------- GLOBAL MIDDLEWARE (ΠΡΩΤΑ) -------------------- */
// Trust proxy so that req.headers['x-forwarded-for'] δουλεύει σωστά πίσω από Cloudflare/Render
app.set("trust proxy", true);

// Basic security headers
app.use(helmet());

// CORS (προσαρμόσιμο μέσω ENV)
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ["GET", "POST", "HEAD"],
  allowedHeaders: ["Content-Type", "X-Admin-Key", "X-EGTransfer-Exe-Secret"]
}));

// Body parsers (πρέπει να είναι πριν τα routes που διαβάζουν req.body)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* -------------------- RATE LIMITERS -------------------- */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // general limit
  standardHeaders: true,
  legacyHeaders: false
});

const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // stricter for verify/login/register
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);

/* ----------------------------------------------------------------- */

/* -------------------- DEBUG BLOCK (SAFE REQUIRE) -------------------- */
function safeRequire(p) {
  try {
    const mod = require(p);
    console.log(`[DEBUG] require("${p}") -> type:`, typeof mod, "keys:", Object.keys(mod || {}));
    return mod;
  } catch (e) {
    console.error(`[DEBUG] require("${p}") FAILED:`, e && e.message);
    throw e;
  }
}

/* Φόρτωσε routes με safeRequire ώστε να βλέπεις άμεσα σφάλματα require */
const registerRoute = safeRequire("./routes/register");
const loginRoute = safeRequire("./routes/login");
const getMetadataRoute = safeRequire("./routes/getMetadata");
const updateMetadataRoute = safeRequire("./routes/updateMetadata");
const getFriendcodeRoute = safeRequire("./routes/getFriendcode");
const searchFriendRoute = safeRequire("./routes/searchFriend");
const sendFriendRequestRoute = safeRequire("./routes/sendFriendRequest");
const getFriendRequestsRoute = safeRequire("./routes/getFriendRequests");
const acceptFriendRequestRoute = safeRequire("./routes/acceptFriendRequest");
const getFriendsRoute = safeRequire("./routes/getFriends");
const emailVerifyIPRoute = safeRequire("./email/emailVerifyIP");
const signalRoute = safeRequire("./routes/signal");
/* ----------------------------------------------------------------- */

/* -------------------- SIMPLE DEBUG / TEST ROUTES -------------------- */
// Test inspector route (πρέπει να υπάρχει το αρχείο ./routes/test.js)
app.use("/test", safeRequire("./routes/test"));

/* -------------------- PROTECTED ADMIN DB VIEWER -------------------- */
/*
  Προστατεύουμε το admin endpoint με X-Admin-Key header.
  Ορίστε ADMIN_KEY στο περιβάλλον (π.χ. ADMIN_KEY=supersecret).
*/
app.get("/admin/db/users", (req, res) => {
  const ADMIN_KEY = process.env.ADMIN_KEY || "";
  const provided = req.headers["x-admin-key"] || "";

  if (!ADMIN_KEY || provided !== ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // register.js (top)
const db = require("../database/db");
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
/* ----------------------------------------------------------------- */

/* -------------------- VERIFY FROM EXE (CAPTURE IP) -------------------- */
/*
  Προστασία: απαιτείται X-EGTransfer-Exe-Secret header που ταιριάζει με EXE_SECRET env var.
  Επίσης εφαρμόζουμε rate limiting για να αποφύγουμε abuse.
*/
app.post("/verifyEmailFromExe", sensitiveLimiter, (req, res) => {
  const EXE_SECRET = process.env.EXE_SECRET || "";
  const providedSecret = req.headers["x-egtransfer-exe-secret"] || "";

  if (!EXE_SECRET || providedSecret !== EXE_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Missing code" });

  // register.js (top)
const db = require("../database/db");

  // Πάρε client IP προτιμώντας x-forwarded-for / cf-connecting-ip / true-client-ip
  const xf = req.headers['x-forwarded-for'] || req.headers['cf-connecting-ip'] || req.headers['true-client-ip'] || req.socket.remoteAddress || '';
  const clientIp = String(xf).split(',')[0].trim();

  db.get("SELECT id FROM users WHERE verificationCode = ?", [code], (selErr, user) => {
    if (selErr) {
      console.error("verifyEmailFromExe select error:", selErr);
      return res.status(500).json({ error: selErr.message });
    }
    if (!user) return res.status(404).json({ error: "Code not found" });

    const now = new Date().toISOString();
    db.run(
      "UPDATE users SET isVerified = 1, verificationCode = '', lastLogin = ?, ip = ? WHERE id = ?",
      [now, clientIp, user.id],
      function(err) {
        if (err) {
          console.error("verifyEmailFromExe update error:", err);
          return res.status(500).json({ error: err.message });
        }
        console.log("verifyEmailFromExe: code", code, "userId", user.id, "clientIp", clientIp, "changes", this.changes);
        res.json({ status: "ok", updated: this.changes, ip: clientIp });
      }
    );
  });
});
/* ----------------------------------------------------------------- */

/* -------------------- REGISTER ROUTES (ΜΕΤΑ ΤΑ MIDDLEWARES) -------------------- */
app.use("/register", sensitiveLimiter, registerRoute);
app.use("/verifyEmail", sensitiveLimiter, safeRequire("./routes/verifyEmail"));
app.use("/login", sensitiveLimiter, loginRoute);
app.use("/adminUsers", safeRequire("./routes/adminUsers"));
app.use("/getMetadata", getMetadataRoute);
app.use("/updateMetadata", updateMetadataRoute);
app.use("/getFriendcode", getFriendcodeRoute);
app.use("/searchFriend", searchFriendRoute);
app.use("/sendFriendRequest", sendFriendRequestRoute);
app.use("/getFriendRequests", getFriendRequestsRoute);
app.use("/acceptFriendRequest", acceptFriendRequestRoute);
app.use("/getFriends", getFriendsRoute);
app.use("/emailVerifyIP", emailVerifyIPRoute);
app.use("/signal", signalRoute);
/* ----------------------------------------------------------------- */

/* Health check endpoints */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.head("/health", (req, res) => {
  res.status(200).end();
});

/* Start server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("EGTransfer Server running on port " + PORT);
});

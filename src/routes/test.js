const express = require("express");
const router = express.Router();

// Simple test route to inspect incoming request and headers
router.all("/inspect", (req, res) => {
  try {
    // Get client IP preferring x-forwarded-for (proxy-aware)
    const forwarded = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || '';
    const clientIp = String(forwarded).split(',')[0].trim();

    const info = {
      method: req.method,
      path: req.originalUrl,
      clientIp,
      headers: req.headers,
      query: req.query,
      body: req.body
    };

    // Log to server console for persistent logs
    console.log("=== REQUEST INSPECT ===");
    console.log("Time:", new Date().toISOString());
    console.log("Method:", info.method);
    console.log("Path:", info.path);
    console.log("Client IP:", info.clientIp);
    console.log("Headers:", JSON.stringify(info.headers));
    console.log("Query:", JSON.stringify(info.query));
    console.log("Body:", JSON.stringify(info.body));
    console.log("=======================");

    // Return JSON so you can inspect from client
    res.json({ status: "ok", inspected: info });
  } catch (err) {
    console.error("inspect route error:", err);
    res.status(500).json({ error: String(err) });
  }
});

module.exports = router;

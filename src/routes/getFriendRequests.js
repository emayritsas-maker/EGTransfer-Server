const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.post("/", (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.json({ status: "error", error: "Missing userId" });

  db.all(
    "SELECT id, fromUserId, toUserId, status, createdAt FROM friend_requests WHERE toUserId = ? AND status = 'pending'",
    [userId],
    (err, rows) => {
      if (err) return res.json({ status: "error", error: err.message || err });
      res.json({ status: "ok", requests: rows || [] });
    }
  );
});

module.exports = router;

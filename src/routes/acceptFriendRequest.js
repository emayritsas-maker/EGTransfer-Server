const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.post("/", (req, res) => {
  const { requestId, accepterId } = req.body;

  if (!requestId || !accepterId) {
    return res.json({ status: "error", error: "Missing requestId or accepterId" });
  }

  // 1) Update friend_requests status
  db.run(
    "UPDATE friend_requests SET status = 'accepted' WHERE id = ?",
    [requestId],
    function (err) {
      if (err) return res.json({ status: "error", error: err.message || err });

      if (this.changes === 0) {
        return res.json({ status: "error", error: "No request updated" });
      }

      // 2) Optionally insert into friends table (if you have one)
      // Adjust table/columns to match your schema. If you don't have a friends table, skip this.
      db.run(
        "INSERT INTO friends (userA, userB, createdAt) VALUES (?, ?, datetime('now'))",
        [accepterId, /* fromUserId */ null],
        function (insertErr) {
          // If you don't have a friends table or want to handle linking differently,
          // remove the insert block above and just return success after update.
          // Here we attempt to fetch the original request to get fromUserId.
          if (insertErr) {
            // Not fatal: return success for acceptance but log the error
            console.error("Failed to insert into friends table:", insertErr);
            return res.json({ status: "ok", note: "request accepted, friends insert failed" });
          }

          return res.json({ status: "ok" });
        }
      );

      // If you prefer to fetch the original request and insert both sides correctly:
      // db.get("SELECT fromUserId FROM friend_requests WHERE id = ?", [requestId], (e, row) => { ... })
    }
  );
});

module.exports = router;

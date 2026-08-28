const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.post("/", (req, res) => {
  const { requestId, accepterId } = req.body;

  if (!requestId || !accepterId) {
    return res.json({ status: "error", error: "Missing requestId or accepterId" });
  }

  // 1) Πάρε το original request για να βρεις το fromUserId
  db.get(
    "SELECT fromUserId, toUserId, status FROM friend_requests WHERE id = ?",
    [requestId],
    (err, row) => {
      if (err) return res.json({ status: "error", error: err.message || err });
      if (!row) return res.json({ status: "error", error: "Request not found" });
      if (row.status !== "pending") return res.json({ status: "error", error: "Request not pending" });
      if (row.toUserId !== accepterId) return res.json({ status: "error", error: "AccepterId mismatch" });

      const fromUserId = row.fromUserId;

      // 2) Update status σε accepted
      db.run(
        "UPDATE friend_requests SET status = 'accepted' WHERE id = ?",
        [requestId],
        function (updateErr) {
          if (updateErr) return res.json({ status: "error", error: updateErr.message || updateErr });

          // 3) Προσθήκη στο friends table αν υπάρχει (προσαρμόζεις ονόματα στηλών αν χρειάζεται)
          // Ελέγχουμε αν υπάρχει πίνακας friends με στήλες userA, userB
          db.get(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='friends'",
            (tableErr, tableRow) => {
              if (tableErr) {
                // Δεν είναι fatal — επιστρέφουμε επιτυχία για την αποδοχή
                console.error("Error checking friends table:", tableErr);
                return res.json({ status: "ok", note: "request accepted, friends table check failed" });
              }

              if (!tableRow) {
                // Δεν υπάρχει friends table — απλά επιστρέφουμε επιτυχία
                return res.json({ status: "ok", note: "request accepted" });
              }

              // Εισαγωγή και των δύο πλευρών (userA <-> userB)
              db.run(
                "INSERT INTO friends (userA, userB, createdAt) VALUES (?, ?, datetime('now'))",
                [fromUserId, accepterId],
                function (insertErr) {
                  if (insertErr) {
                    console.error("Failed to insert into friends:", insertErr);
                    return res.json({ status: "ok", note: "request accepted, friends insert failed" });
                  }

                  return res.json({ status: "ok" });
                }
              );
            }
          );
        }
      );
    }
  );
});

module.exports = router;

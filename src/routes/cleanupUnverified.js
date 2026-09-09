const express = require("express");
const router = express.Router();
const db = require("../database/db");

// Διαγράφει χρήστες που δεν έκαναν verify μέσα σε 5 λεπτά
router.get("/", (req, res) => {
    db.run(
        "DELETE FROM users WHERE isVerified = 0 AND createdAt <= datetime('now', '-5 minutes')",
        function(err) {
            if (err) {
                console.error("Cleanup error:", err);
                return res.json({ status: "error", error: "Database error" });
            }

            return res.json({
                status: "ok",
                deleted: this.changes
            });
        }
    );
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { getDatabase } = require("firebase-admin/database");

router.post("/", async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.json({ status: "error", error: "Missing username" });
    }

    const db = getDatabase();

    try {
        const snapshot = await db.ref(`users/${username}/pending`).get();
        const pending = snapshot.val() || [];

        return res.json({ status: "ok", requests: pending });

    } catch (err) {
        return res.json({ status: "error", error: err.message });
    }
});

module.exports = router;

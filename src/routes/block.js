const express = require("express");
const router = express.Router();
const { getDatabase } = require("firebase-admin/database");

router.post("/", async (req, res) => {
    const { owner, target } = req.body;

    if (!owner || !target) {
        return res.json({ status: "error", error: "Missing owner or target" });
    }

    const db = getDatabase();

    try {
        await db.ref(`users/${owner}/blocked`).transaction(list => {
            if (!list) return [target];
            if (!list.includes(target)) list.push(target);
            return list;
        });

        return res.json({ status: "ok" });

    } catch (err) {
        return res.json({ status: "error", error: err.message });
    }
});

module.exports = router;

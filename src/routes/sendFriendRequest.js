const express = require("express");
const router = express.Router();
const { getDatabase } = require("firebase-admin/database");

router.post("/", async (req, res) => {
    const { from, to } = req.body;

    if (!from || !to) {
        return res.json({ status: "error", error: "Missing from or to" });
    }

    const db = getDatabase();

    try {
        // Βάλε το "from" στο pending του "to"
        await db.ref(`users/${to}/pending`).transaction(list => {
            if (!list) return [from];
            if (!list.includes(from)) list.push(from);
            return list;
        });

        return res.json({ status: "ok" });

    } catch (err) {
        return res.json({ status: "error", error: err.message });
    }
});

module.exports = router;

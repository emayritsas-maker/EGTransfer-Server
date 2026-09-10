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
        // 1) Βγάλε το "from" από τα pending του "to"
        await db.ref(`users/${to}/pending`).transaction(list => {
            if (!list) return [];
            return list.filter(x => x !== from);
        });

        // 2) Βάλε το "from" στα friends του "to"
        await db.ref(`users/${to}/friends`).transaction(list => {
            if (!list) return [from];
            if (!list.includes(from)) list.push(from);
            return list;
        });

        // 3) Βάλε το "to" στα friends του "from"
        await db.ref(`users/${from}/friends`).transaction(list => {
            if (!list) return [to];
            if (!list.includes(to)) list.push(to);
            return list;
        });

        return res.json({ status: "ok" });

    } catch (err) {
        return res.json({ status: "error", error: err.message });
    }
});

module.exports = router;

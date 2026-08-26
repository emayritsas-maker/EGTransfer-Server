const express = require("express");
const router = express.Router();

// Temporary in-memory store (simple signaling)
let signals = {};

router.post("/", (req, res) => {
    const { from, to, type, data } = req.body;

    if (!from || !to || !type || !data) {
        return res.json({ status: "error", error: "Missing fields" });
    }

    // Create bucket for receiver if not exists
    if (!signals[to]) {
        signals[to] = [];
    }

    // Store the signal
    signals[to].push({
        from,
        type,
        data
    });

    return res.json({ status: "ok" });
});

// Client polls to receive pending signals
router.post("/receive", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.json({ status: "error", error: "Missing username" });
    }

    const pending = signals[username] || [];
    signals[username] = []; // clear after sending

    return res.json({
        status: "ok",
        signals: pending
    });
});

module.exports = router;

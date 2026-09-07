const express = require("express");
const router = express.Router();
const path = require("path");

// Serve the reset password HTML page
router.get("/", (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.send("<h1>Invalid reset link.</h1>");
    }

    // Send your HTML file
    res.sendFile(path.join(__dirname, "../../public/reset.html"));
});

module.exports = router;

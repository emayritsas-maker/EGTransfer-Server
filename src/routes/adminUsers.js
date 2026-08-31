const express = require("express");
const router = express.Router();
const db = require("../database/db");

// HTML πίνακας με κουμπιά edit
router.get("/", (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) return res.send("Error: " + err.message);

        let html = "<h1>Users</h1><table border='1'>";
        html += "<tr><th>ID</th><th>Username</th><th>Email</th><th>Actions</th></tr>";

        rows.forEach(u => {
            html += `<tr>
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td>
                    <form method="POST" action="/adminUsers/update">
                        <input type="hidden" name="id" value="${u.id}" />
                        <input type="text" name="email" value="${u.email}" />
                        <button type="submit">Update</button>
                    </form>
                </td>
            </tr>`;
        });

        html += "</table>";
        res.send(html);
    });
});

// Route για update
router.post("/update", (req, res) => {
    const { id, email } = req.body;

    db.run("UPDATE users SET email = ? WHERE id = ?", [email, id], function(err) {
        if (err) return res.send("Error: " + err.message);
        res.redirect("/adminUsers");
    });
});

module.exports = router;

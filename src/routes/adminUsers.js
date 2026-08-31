const express = require("express");
const router = express.Router();
const db = require("../database/db"); // προσαρμόζεις το path αν χρειάζεται

// Λίστα χρηστών με κουμπί Edit
router.get("/", (req, res) => {
  db.all("SELECT id, username, email FROM users", (err, rows) => {
    if (err) return res.status(500).send("DB error: " + err.message);

    let html = `
      <h1>Users</h1>
      <table border="1" cellpadding="6" cellspacing="0">
        <tr><th>ID</th><th>Username</th><th>Email</th><th>Actions</th></tr>
    `;

    rows.forEach(u => {
      html += `
        <tr>
          <td>${u.id}</td>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td>
            <a href="/adminUsers/edit/${u.id}">Edit</a>
            &nbsp;|&nbsp;
            <form method="POST" action="/adminUsers/delete/${u.id}" style="display:inline" onsubmit="return confirm('Delete user ${u.username}?')">
              <button type="submit">Delete</button>
            </form>
          </td>
        </tr>
      `;
    });

    html += `</table>`;
    res.send(html);
  });
});

// Φόρμα edit για συγκεκριμένο χρήστη
router.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT id, username, email FROM users WHERE id = ?", [id], (err, user) => {
    if (err) return res.status(500).send("DB error: " + err.message);
    if (!user) return res.status(404).send("User not found");

    const html = `
      <h1>Edit User ${user.id}</h1>
      <form method="POST" action="/adminUsers/update/${user.id}">
        <label>Username</label><br/>
        <input type="text" name="username" value="${user.username}" required /><br/><br/>
        <label>Email</label><br/>
        <input type="email" name="email" value="${user.email}" required /><br/><br/>
        <label>New Password (leave blank to keep)</label><br/>
        <input type="password" name="password" /><br/><br/>
        <button type="submit">Save</button>
        <a href="/adminUsers" style="margin-left:10px">Cancel</a>
      </form>
    `;
    res.send(html);
  });
});

// Update route
router.post("/update/:id", (req, res) => {
  const id = req.params.id;
  const { username, email, password } = req.body;

  // Αν θέλεις hashing password, κάν' το εδώ πριν το UPDATE
  if (password && password.length > 0) {
    // απλό παράδειγμα χωρίς hashing (μην το χρησιμοποιήσεις σε παραγωγή)
    db.run("UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?",
      [username, email, password, id],
      function(err) {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.redirect("/adminUsers");
      });
  } else {
    db.run("UPDATE users SET username = ?, email = ? WHERE id = ?",
      [username, email, id],
      function(err) {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.redirect("/adminUsers");
      });
  }
});

// Delete route
router.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).send("DB error: " + err.message);
    res.redirect("/adminUsers");
  });
});

module.exports = router;

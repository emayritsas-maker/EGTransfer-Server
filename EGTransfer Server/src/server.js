const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());

// ROUTES
app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
app.use("/searchFriend", require("./routes/searchFriend"));
app.use("/sendFriendRequest", require("./routes/sendFriendRequest"));

app.listen(3000, () => {
    console.log("EGTransfer Server running on port 3000");
});

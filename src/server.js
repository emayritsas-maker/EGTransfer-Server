const express = require("express");
const app = express();
const path = require("path");

// Load DB
require("./database/db");

app.use(express.json());

// ROUTES
app.use("/register", require("./src/routes/register"));
app.use("/login", require("./src/routes/login"));
app.use("/getMetadata", require("./src/routes/getMetadata"));
app.use("/updateMetadata", require("./src/routes/updateMetadata"));
app.use("/getFriendcode", require("./src/routes/getFriendcode"));
app.use("/searchFriend", require("./src/routes/searchFriend"));
app.use("/sendFriendRequest", require("./src/routes/sendFriendRequest"));
app.use("/getFriendRequests", require("./src/routes/getFriendRequests"));
app.use("/acceptFriendRequest", require("./src/routes/acceptFriendRequest"));
app.use("/getFriends", require("./src/routes/getFriends"));
app.use("/emailVerifyIP", require("./src/routes/emailVerifyIP"));
app.use("/signal", require("./src/routes/signal"));

app.listen(3000, () => {
    console.log("EGTransfer Server running on port 3000");
});

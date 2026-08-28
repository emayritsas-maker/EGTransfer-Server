const express = require("express");
const app = express();
const path = require("path");

// Load DB
require("./database/db");

app.use(express.json());

app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
app.use("/getMetadata", require("./routes/getMetadata"));
app.use("/updateMetadata", require("./routes/updateMetadata"));
app.use("/getFriendcode", require("./routes/getFriendcode"));
app.use("/searchFriend", require("./routes/searchFriend"));
app.use("/sendFriendRequest", require("./routes/sendFriendRequest"));
app.use("/getFriendRequests", require("./routes/getFriendRequests"));
app.use("/acceptFriendRequest", require("./routes/acceptFriendRequest"));
app.use("/getFriends", require("./routes/getFriends"));
app.use("/emailVerifyIP", require("./routes/emailVerifyIP"));
app.use("/signal", require("./routes/signal"));

app.listen(3000, () => {
    console.log("EGTransfer Server running on port 3000");
});

const express = require("express");
const app = express();
const path = require("path");

// Load DB
require("./database/db");

app.use(express.json());

/* -------------------- DEBUG BLOCK (ΒΑΛΤΟ ΕΔΩ) -------------------- */
function safeRequire(p) {
  try {
    const mod = require(p);
    console.log(`[DEBUG] require("${p}") -> type:`, typeof mod, "keys:", Object.keys(mod));
    return mod;
  } catch (e) {
    console.error(`[DEBUG] require("${p}") FAILED:`, e && e.message);
    throw e;
  }
}

const registerRoute = safeRequire("./routes/register");
const loginRoute = safeRequire("./routes/login");
const getMetadataRoute = safeRequire("./routes/getMetadata");
const updateMetadataRoute = safeRequire("./routes/updateMetadata");
const getFriendcodeRoute = safeRequire("./routes/getFriendcode");
const searchFriendRoute = safeRequire("./routes/searchFriend");
const sendFriendRequestRoute = safeRequire("./routes/sendFriendRequest");
const getFriendRequestsRoute = safeRequire("./routes/getFriendRequests");
const acceptFriendRequestRoute = safeRequire("./routes/acceptFriendRequest");
const getFriendsRoute = safeRequire("./routes/getFriends");
const emailVerifyIPRoute = safeRequire("./email/emailVerifyIP");
const signalRoute = safeRequire("./routes/signal");
/* --------------------------------------------------------------- */

/* ΤΩΡΑ βάζεις τα app.use με τις μεταβλητές */
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/getMetadata", getMetadataRoute);
app.use("/updateMetadata", updateMetadataRoute);
app.use("/getFriendcode", getFriendcodeRoute);
app.use("/searchFriend", searchFriendRoute);
app.use("/sendFriendRequest", sendFriendRequestRoute);
app.use("/getFriendRequests", getFriendRequestsRoute);
app.use("/acceptFriendRequest", acceptFriendRequestRoute);
app.use("/getFriends", getFriendsRoute);
app.use("/emailVerifyIP", require("./email/emailVerifyIP"));
app.use("/signal", signalRoute);
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
// Για UptimeRobot free που κάνει HEAD requests
app.head("/health", (req, res) => {
  res.status(200).end();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("EGTransfer Server running on port " + PORT);
});

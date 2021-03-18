const express = require("express");
const router = express.Router();

const User = require("../models/users");

const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");

router.get("/", ensureAuthenticated, async (req, res, next) => {
  const userId = req.session.passport.user;
  user = await User.findOne({ _id: userId });
  res.render("home", {
    title: "Welcome to Slack (the Clone)",
    view: "chat",
    name: user.name,
    profileImage: user.profileImage,
    scriptsPath: [
      "/socket.io/socket.io.js",
      "/js/socket-script.js",
      "/js/main-script.js",
      "/js/chat-script.js",
    ],
    ...icons,
  });
});

module.exports = router;

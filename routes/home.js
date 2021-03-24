const express = require("express");
const router = express.Router();

const User = require("../models/users");
const Messages = require("../models/messages");

const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");

router.get("/", ensureAuthenticated, async (req, res, next) => {
  const userId = req.session.passport.user;
  const user = await User.findOne({ _id: userId });
  const messages = await Messages.find();
  const sendersArray = [];
  for (message of messages) {
    const name = await User.findOne({ _id: message.userId });
    sendersArray.push(name);
  }

  console.log(sendersArray);
  res.render("home", {
    title: "Welcome to Slack (the Clone)",
    messages: messages ? messages : -1,
    senders: sendersArray,
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

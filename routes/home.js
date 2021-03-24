const express = require("express");
const router = express.Router();
const moment = require("moment");

const User = require("../models/users");
const Messages = require("../models/messages");

const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");
const { isNewDay } = require("../utils/checkLatestMsg");

router.get("/", ensureAuthenticated, async (req, res, next) => {
  const userId = req.session.passport.user;
  const user = await User.findOne({ _id: userId });
  const messages = await Messages.find();
  const sendersArray = [];
  const formatedDate = [];
  const writeHeaderDate = [];

  for (message of messages) {
    const name = await User.findOne({ _id: message.userId });
    const checkForNewDay = await isNewDay(message);
    sendersArray.push(name);
    writeHeaderDate.push(checkForNewDay);

    formatedDate.push({
      day: moment(message.date).format("MMMM Do, YYYY"),
      hour: moment(message.date).format("HH:MM"),
    });
  }

  res.render("home", {
    title: "Welcome to Slack (the Clone)",
    messages: messages ? messages : -1,
    senders: sendersArray,
    date: formatedDate,
    writeHeaderDate: writeHeaderDate,
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

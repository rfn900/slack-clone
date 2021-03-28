const express = require("express");
const router = express.Router();
const moment = require("moment");

const User = require("../models/users");
const Room = require("../models/rooms");

const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");
const { isNewDay } = require("../utils/checkLatestMsg");
const Rooms = require("../models/rooms");

router.get("/", ensureAuthenticated, async (req, res, next) => {
  console.log(req.headers.referer);

  const userId = req.session.passport.user;
  const user = await User.findOne({ _id: userId });
  const rooms = await Rooms.find({ private: false }).sort({ date: -1 });

  res.render("homeTest", {
    title: "Welcome to Slack (the Clone)",
    name: user.name,
    roomId: "no-room",
    userId: userId,
    rooms: rooms,
    profileImage: user.profileImage,
    scriptsPath: ["/socket.io/socket.io.js", "/js/main-script.js"],
    ...icons,
  });
});

module.exports = router;

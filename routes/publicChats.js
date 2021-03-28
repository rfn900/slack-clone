const express = require("express");
const router = express.Router();
const moment = require("moment");

const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");

const User = require("../models/users");
const Rooms = require("../models/rooms");

router.get("/", ensureAuthenticated, async (req, res, next) => {
  const userId = req.session.passport.user;
  const rooms = await Rooms.find({ private: false }).sort({ date: -1 });
  user = await User.findOne({ _id: userId });

  res.render("publicChats", {
    rooms: rooms,
    roomId: "no-room",
    profileImage: user.profileImage,
    name: user.name,
    userId: userId,
    scriptsPath: ["/socket.io/socket.io.js", "js/main-script.js"],
    ...icons,
  });
});

module.exports = router;

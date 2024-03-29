const express = require("express");
const router = express.Router();
const moment = require("moment");

const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");

const User = require("../models/users");
const Rooms = require("../models/rooms");

router.get("/", ensureAuthenticated, async (req, res, next) => {
  const userId = req.session.passport.user;
  const user = await User.findOne({ _id: userId });
  const rooms = await Rooms.find({ private: false }).sort({ date: -1 });
  res.render("home", {
    rooms: rooms,
    roomId: "no-room",
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    date: moment(user.date).format("MMMM Do, YYYY"),
    view: "profile",
    scriptsPath: ["js/main-script.js", "js/profile-script.js"],
    ...icons,
  });
});

module.exports = router;

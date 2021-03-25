const express = require("express");
const router = express.Router();
const moment = require("moment");

const User = require("../models/users");

const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");
const { isNewDay } = require("../utils/checkLatestMsg");

router.get("/", ensureAuthenticated, async (req, res, next) => {
  const userId = req.session.passport.user;
  const user = await User.findOne({ _id: userId });

  res.render("homeTest", {
    title: "Welcome to Slack (the Clone)",
    name: user.name,
    userId: userId,
    profileImage: user.profileImage,
    scriptsPath: ["/socket.io/socket.io.js", "/js/main-script.js"],
    ...icons,
  });
});

module.exports = router;

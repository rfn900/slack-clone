const express = require("express");
const router = express.Router();
const moment = require("moment");

const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");

const User = require("../models/users");

router.get("/", ensureAuthenticated, async (req, res, next) => {
  const userId = req.session.passport.user;
  user = await User.findOne({ _id: userId });
  res.render("home", {
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

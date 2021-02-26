const express = require("express");
const router = express.Router();

/* Adding GET method to homepage */
router.get("/", (req, res, next) => {
  res.render("home", { title: "Welcome to Slack (the Clone)" });
});

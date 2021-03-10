const express = require("express");
const router = express.Router();

/* Adding GET method to homepage */
router.get("/", (req, res, next) => {
  res.render("login");
});

module.exports = router;

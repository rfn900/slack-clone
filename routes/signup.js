const express = require("express");
const router = express.Router();

/* Adding GET method to homepage */
router.get("/", (req, res, next) => {
  res.render("signup");
});

module.exports = router;

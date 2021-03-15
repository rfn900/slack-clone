const express = require("express");
const router = express.Router();

/* Adding GET method to homepage */
router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", (req, res) => {
  console.log(req.body);
  res.send("funcionou porra!");
});

module.exports = router;

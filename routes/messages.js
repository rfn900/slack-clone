const express = require("express");
const io = require("../app");
const router = express.Router();

const User = require("../models/users");
const Message = require("../models/messages");
/* Adding GET method to homepage */
router.post("/", async (req, res, next) => {
  const userId = req.session.passport.user;
  const user = User.findOne({ _id: userId });
  const payload = {
    userId: userId,
    content: req.body.message,
  };
  var message = new Message(payload);
  try {
    await message.save();
    io.emit("chat message", {
      sender: user.name,
      body: req.body.message,
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;

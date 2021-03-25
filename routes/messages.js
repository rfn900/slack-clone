const express = require("express");
const router = express.Router();
const moment = require("moment");

const User = require("../models/users");
const Messages = require("../models/messages");
const Rooms = require("../models/rooms");

const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");
const { isFirstMsgToday } = require("../utils/checkLatestMsg");

function returnRouter(io) {
  router.post("/", ensureAuthenticated, async (req, res, next) => {
    const userId = req.session.passport.user;

    const user = await User.findOne({ _id: userId });
    const payload = {
      userId: userId,
      content: req.body.message,
      roomId: req.body.roomId,
    };

    let message = new Messages(payload);
    let checkNewDay = await isFirstMsgToday(message);
    try {
      await message.save();
      io.emit("chat message", {
        sender: user.name,
        body: req.body.message,
        profileImageSrc: user.profileImage,
        hour: moment(message.date).format("HH:mm"),
        newDay: checkNewDay
          ? moment(message.date).format("MMMM Do, YYYY")
          : null,
        _id: message._id,
      });
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

  router.post("/reaction", ensureAuthenticated, async (req, res) => {
    const { emoji, _id } = req.body;
    const message = await Messages.findOne({ _id: _id });

    let emojiCount = 0;
    if (message.reactions.length > 0) {
      message.reactions.forEach(async (reaction) => {
        if (reaction.emoji == emoji) {
          emojiCount = reaction.count;
          try {
            await Messages.updateOne(
              {
                _id: _id,
                "reactions.emoji": emoji,
              },
              { $inc: { "reactions.$.count": 1 } }
            );
            io.emit("emoji", {
              emoji: reaction.emoji,
              count: reaction.count + 1,
              messageId: message._id,
            });
            res.sendStatus(200);
          } catch (error) {
            throw error;
          }
        }
      });
    }

    if (emojiCount == 0) {
      message.reactions.push({
        emoji: emoji,
        count: 1,
      });
      try {
        await message.save();

        io.emit("emoji", {
          emoji: emoji,
          count: 1,
          messageId: message._id,
        });

        res.sendStatus(200);
      } catch (error) {
        res.sendStatus(500);
      }
    }
  });

  return router;
}

module.exports = returnRouter;

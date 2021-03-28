const express = require("express");
const router = express.Router();
const moment = require("moment");

const User = require("../models/users");
const Messages = require("../models/messages");
const Rooms = require("../models/rooms");

const { uploadPath, upload } = require("../utils/upload");
const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");
const { isFirstMsgToday } = require("../utils/checkLatestMsg");

function returnRouter(io) {
  router.post("/edit/:msgId", ensureAuthenticated, async (req, res) => {
    const updatedContent = req.body.messageEdit;
    const msgId = req.params.msgId;
    const referer = req.headers.referer;
    const message = await Messages.findOne({ _id: msgId });

    message.content = updatedContent;
    await message.save();
    res.redirect(referer);
  });

  router.get("/mentions", ensureAuthenticated, async (req, res) => {
    const messages = await Messages.find();
    const userId = req.session.passport.user;
    const user = await User.findOne({ _id: userId });
    const rooms = await Rooms.find();
    const messagesWithMentions = messages.filter((msg) =>
      msg.mentions.includes(userId)
    );
    const senders = [];
    const formatedHours = [];
    const formatedDays = [];
    for (message of messagesWithMentions) {
      const senderName = await User.findOne({ _id: message.userId });
      const day = moment(message.date).format("MMMM Do, YYYY");
      const hour = moment(message.date).format("HH:mm");
      formatedHours.push(hour);
      formatedDays.push(day);
      senders.push(senderName);
    }

    res.render("mentions", {
      senders,
      messages: messagesWithMentions,
      days: formatedDays,
      hours: formatedHours,
      name: user.name,
      rooms,
      ...icons,
      profileImage: user.profileImage,
      scriptsPath: [
        "/socket.io/socket.io.js",
        "../js/main-script.js",
        "../js/chat-script.js",
      ],
    });
  });

  router.post("/delete/:msgId", ensureAuthenticated, async (req, res) => {
    const referer = req.headers.referer;
    const messageId = req.params.msgId;
    await Messages.deleteOne({ _id: messageId });
    res.redirect(referer);
  });

  router.post(
    "/upload-file",
    upload.single("chat_upload_pic"),
    async (req, res) => {
      const ref = req.headers.referer;
      console.log(req.file);
      if (!isRightReferer(ref)) {
        console.log("fail", isRightReferer(ref));
        res.sendStatus(500);
      } else {
        // Upload file and emit socket event with details

        const roomId = ref.split("/")[ref.split("/").length - 1];
        const imagePath = uploadPath + req.file.filename;

        if (req.file.size > 0) {
          console.log(`File uploaded to ${imagePath}`);
          const userId = req.session.passport.user;
          const user = await User.findOne({ _id: userId });
          console.log(userId, "userId");
          const payload = {
            content: `../uploads/${req.file.filename}`,
            contentType: "image",
            userId,
            roomId,
          };
          const message = new Messages(payload);

          let checkNewDay = await isFirstMsgToday(message);

          try {
            await message.save();
            io.to(roomId).emit("chat message", {
              sender: user.name,
              body: payload.content,
              contentType: payload.contentType,
              profileImageSrc: `../${user.profileImage}`,
              hour: moment(message.date).format("HH:mm"),
              newDay: checkNewDay
                ? moment(message.date).format("MMMM Do, YYYY")
                : null,
              _id: message._id,
            });
            res.status(200);
            res.redirect(`/room/${roomId}`);
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  );

  router.get("/:msgId", ensureAuthenticated, async (req, res) => {
    const messageId = req.params.msgId;

    try {
      const message = await Messages.findOne({ _id: messageId });
      console.log(message);
      data = {
        senderId: message.userId,
      };
      res.json(data);
    } catch (error) {
      res.json({ error: error.message });
    }
  });

  return router;
}

function isRightReferer(path) {
  //TODO - check if path is the type http://localhosta:3000/room/:number
  //console.log(path.match(/\/room\/.{24}$/), "REGEX");
  return path.match(/\/room\/.{24}$/) ? true : false;
}
module.exports = returnRouter;

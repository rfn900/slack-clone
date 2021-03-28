const express = require("express");
const router = express.Router();
const moment = require("moment");

const User = require("../models/users");
const Messages = require("../models/messages");
const Rooms = require("../models/rooms");
const { ensureAuthenticated } = require("../config/auth");
const icons = require("../utils/icons");
const { isNewDay } = require("../utils/checkLatestMsg");

router.get("/:roomId", ensureAuthenticated, async (req, res, next) => {
  const userId = req.session.passport.user;
  const roomId = req.params.roomId;
  const room = await Rooms.findOne({ _id: roomId });
  const rooms = await Rooms.find({ private: false }).sort({ date: -1 });

  const user = await User.findOne({ _id: userId });
  const messages = await Messages.find({ roomId: roomId });

  //const messages = await Messages.find();
  const sendersArray = [];
  const formatedDate = [];
  const writeHeaderDate = [];
  const userIdToName = {};
  for (message of messages) {
    const name = await User.findOne({ _id: message.userId });

    for (mention of message.mentions) {
      const mentionedUser = await User.findOne({ _id: mention });
      if (!message.content.includes("@"))
        message.content += `   <span style="color:darkblue">@${mentionedUser.name}</span>`;
    }
    const checkForNewDay = await isNewDay(message);
    sendersArray.push(name);
    writeHeaderDate.push(checkForNewDay);

    formatedDate.push({
      day: moment(message.date).format("MMMM Do, YYYY"),
      hour: moment(message.date).format("HH:MM"),
    });
  }
  const imgSrc = `../${user.profileImage}`;
  res.render("home", {
    title: "Welcome to Slack (the Clone)",
    rooms: rooms,
    roomId: roomId,
    roomName: room.name,
    messages: messages ? messages : -1,
    senders: sendersArray,
    date: formatedDate,
    writeHeaderDate: writeHeaderDate,
    view: "chat",
    name: user.name,
    userId: userId,
    profileImage: imgSrc,
    scriptsPath: [
      "/socket.io/socket.io.js",
      "../js/socket-script.js",
      "../js/main-script.js",
      "../js/chat-script.js",
    ],
    ...icons,
  });
});

router.post("/create", ensureAuthenticated, async (req, res) => {
  const { roomName, isRoomPrivate } = req.body;
  // console.log(roomName, isRoomPrivate);

  const userId = req.session.passport.user;
  const user = await User.findOne({ _id: userId });

  const payload = {
    name: roomName,
    createdBy: userId,
    private: isRoomPrivate === "on" ? true : false,
  };

  let room = new Rooms(payload);
  console.log(payload);
  // console.log(await isNewDay(message), "aqui");
  res.status(200);
  try {
    await room.save();
    res.status(200);
    res.redirect(`/room/${room._id}`);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;

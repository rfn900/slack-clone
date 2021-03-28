const mongoose = require("mongoose");

const MessagesSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },

  contentType: {
    type: String,
    required: true,
  },
  mentions: [mongoose.ObjectId],
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  reactions: [Object],

  roomId: {
    type: mongoose.ObjectId,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Messages = mongoose.model("Messages", MessagesSchema);

module.exports = Messages;

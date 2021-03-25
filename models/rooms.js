const mongoose = require("mongoose");

const RoomsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  createdBy: {
    type: mongoose.ObjectId,
    required: true,
  },

  private: {
    type: Boolean,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const Rooms = mongoose.model("Rooms", RoomsSchema);

module.exports = Rooms;

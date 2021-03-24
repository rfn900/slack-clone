const Messages = require("../models/messages");
const moment = require("moment");

const isFirstMsgToday = async (msg) => {
  var mostRecentMsg = await Messages.findOne(
    {},
    {},
    {
      sort: { date: -1 },
    }
  );
  let needNewDay = true;
  // Don't need to write out a new d ay if there is a message already today
  if (mostRecentMsg) {
    needNewDay =
      moment(mostRecentMsg.date).format("MMMM Do, YYYY") !=
      moment(msg.date).format("MMMM Do, YYYY");
  }

  return needNewDay;
};

const isNewDay = async (msg) => {
  var messagesArray = await Messages.find({ date: { $lte: msg.date } });
  //console.log(messagesArray);
  if (messagesArray.length < 2) return true;

  let newDay =
    moment(messagesArray[messagesArray.length - 2].date).format(
      "MMMM Do, YYYY"
    ) != moment(msg.date).format("MMMM Do, YYYY");

  return newDay;
};

module.exports = {
  isFirstMsgToday,
  isNewDay,
};

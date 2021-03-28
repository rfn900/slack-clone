const express = require("express");

const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const logger = require("morgan");
const path = require("path");
const sassMiddleware = require("node-sass-middleware");
const moment = require("moment");

require("./config/passport")(passport);
const { isFirstMsgToday } = require("./utils/checkLatestMsg");
// Connecting with mongodb
mongoose
  .connect("mongodb://localhost:27017/slack_clone", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db"))
  .catch((error) => console.log(error));

const User = require("./models/users");
const Message = require("./models/messages");

// Setting up sessions
app.use(
  session({
    secret: "wet cat",
    resave: true,
    saveUninitialized: true,
  })
);
// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

// Setting up our routes
var homeRouter = require("./routes/home");
var usersRouter = require("./routes/users");
var profileRouter = require("./routes/profile");
var roomsRouter = require("./routes/room");
var publicChatsRouter = require("./routes/publicChats");
var messagesRouter = require("./routes/messages")(io);

// Setting up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares:
app.use(express.urlencoded({ extended: false }));
// app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());

app.use(
  sassMiddleware({
    src: path.join(__dirname, "scss"),
    dest: path.join(__dirname, "public"),
    outputStyle: "compressed",
  })
);
app.use(express.static(path.join(__dirname, "public")));

app.use("/", homeRouter);
app.use("/users", usersRouter);
app.use("/profile", profileRouter);
app.use("/room", roomsRouter);
app.use("/public-chats", publicChatsRouter);
app.use("/message", messagesRouter);

// Setting up the socket:

io.on("connection", (socket) => {
  console.log("User just connected");
  socket.on("join room", ({ username, currentUserId, room, roomId }) => {
    socket.join(roomId);

    socket.on("chat message", async (payload) => {
      // console.log(payload);
      const { content, userId, mentions } = payload;
      const user = await User.findOne({ _id: userId });
      const mentionedNames = [];
      for (mention of mentions) {
        const userMentioned = await User.findOne({ _id: mention });
        mentionedNames.push(userMentioned.name);
      }
      let message = new Message({ ...payload, contentType: "text" });

      let checkNewDay = await isFirstMsgToday(message);

      try {
        await message.save();
        io.to(roomId).emit("chat message", {
          senderId: user._id,
          sender: user.name,
          body: content,
          mentions: mentionedNames,
          contentType: "text",
          profileImageSrc: `../${user.profileImage}`,
          hour: moment(message.date).format("HH:mm"),
          newDay: checkNewDay
            ? moment(message.date).format("MMMM Do, YYYY")
            : null,
          _id: message._id,
        });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("emoji", async (data) => {
      const { emoji, _id } = data;
      const message = await Message.findOne({ _id: _id });

      let emojiCount = 0;
      if (message.reactions.length > 0) {
        message.reactions.forEach(async (reaction) => {
          if (reaction.emoji == emoji) {
            emojiCount = reaction.count;
            try {
              await Message.updateOne(
                {
                  _id: _id,
                  "reactions.emoji": emoji,
                },
                { $inc: { "reactions.$.count": 1 } }
              );
              io.to(roomId).emit("emoji", {
                emoji: reaction.emoji,
                count: reaction.count + 1,
                messageId: message._id,
              });
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

          io.to(roomId).emit("emoji", {
            emoji: emoji,
            count: 1,
            messageId: message._id,
          });
        } catch (error) {
          console.log(error);
        }
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Server starts listening:
const port = process.env.PORT || 3000;
http.listen(3000, () =>
  console.log(`Server running on http://localhost:${port}`)
);

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socket = require("socket.io");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const logger = require("morgan");
const path = require("path");
const sassMiddleware = require("node-sass-middleware");

const app = express();

require("./config/passport")(passport);

// Connecting with mongodb
mongoose
  .connect("mongodb://localhost:27017/slack_clone", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db"))
  .catch((error) => console.log(error));

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

const io = socket(http);
const server = http.Server(app);

// Setting up our routes
var homeRouter = require("./routes/home");
var chatRouter = require("./routes/chat");
var usersRouter = require("./routes/users");
var profileRouter = require("./routes/profile");
// Setting up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares:
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(cookieParser());
console.log(path.join(__dirname, "scss"), path.join(__dirname, "public/css"));

app.use(
  sassMiddleware({
    src: path.join(__dirname, "scss"),
    dest: path.join(__dirname, "public"),
    outputStyle: "compressed",
  })
);
app.use(express.static(path.join(__dirname, "public")));

app.use("/", homeRouter);
app.use("/chat", chatRouter);
app.use("/users", usersRouter);
app.use("/profile", profileRouter);

// Setting up the socket:

io.on("connection", (socket) => {
  console.log("User just connected");

  socket.on("chat message", (message) => {
    io.emit("chat message", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Server starts listening:
const port = process.env.PORT || 3000;

server.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);

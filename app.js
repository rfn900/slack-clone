const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socket = require("socket.io");
const flash = require("flash");
const session = require("session");
const passport = require("passport");

const app = express();

require("./config/passport")(passport);

// styling with sassMiddleware
const sassMiddleware = require("node-sass-middleware");

const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const path = require("path");
dotenv.config();

const io = socket(http);
const server = http.Server(app);

// Connecting with mongodb
mongoose
  .connect("mongodb://localhost:27017/users", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db"))
  .catch((error) => console.log(error));

// Setting up our routes
var homeRouter = require("./routes/home");
var chatRouter = require("./routes/chat");
var loginRouter = require("./routes/login");
var signupRouter = require("./routes/signup");

// Setting up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares:
app.use(express.urlencoded({ extended: false }));

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
app.use("/login", loginRouter);
app.use("/signup", signupRouter);

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

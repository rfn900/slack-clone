const express = require("express");
const http = require("http");
const socket = require("socket.io");
const path = require("path");
const sassMiddleware = require("node-sass-middleware");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const io = socket(http);
const server = http.Server(app);

// Setting up our routes
var homeRouter = require("./routes/home");
var chatRouter = require("./routes/chat");

// Setting up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares:
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
console.log(path.join(__dirname, 'scss'),path.join(__dirname,'public/css'))

app.use(sassMiddleware({
  src: path.join(__dirname, 'scss'),
  dest: path.join(__dirname,'public'),
  outputStyle: "compressed"
}));
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', homeRouter)
app.use("/chat", chatRouter);

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

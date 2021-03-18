document.addEventListener("DOMContentLoaded", (e) => {
  const socket = io();

  const form = document.getElementById("main-chat-form");
  const chatInput = document.getElementById("main-chat-input");
  console.log(socket, "aqui");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    socket.emit("chat message", chatInput.value);
    chatInput.value = "";
    return false;
  });
  socket.on("chat message", (msg) => {
    console.log("user writes", msg);
  });
});

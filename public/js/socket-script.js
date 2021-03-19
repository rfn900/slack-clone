document.addEventListener("DOMContentLoaded", (e) => {
  const socket = io();
  const form = document.getElementById("main-chat-form");
  const chatInput = document.getElementById("main-chat-input");
  const messagesUl = document.getElementById("messages");
  const chatSubmitBtn = document.getElementById("chat-submit-button");
  console.log(document.cookie, "aqui");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      message: chatInput.value,
    };
    await fetch("http://localhost:3000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    chatInput.value = "";
    chatSubmitBtn.setAttribute("disabled", "true");
    return false;
  });
  socket.on("chat message", (msg) => {
    const li = document.createElement("li");
    li.innerHTML = `<img src="${msg.profileImageSrc}" style="width: 40px; object-fit: contain"/>${msg.sender}: ${msg.body}`;
    messagesUl.appendChild(li);
  });
});

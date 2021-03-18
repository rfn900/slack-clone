document.addEventListener("DOMContentLoaded", (e) => {
  const mainChatInput = document.getElementById("main-chat-input");
  const chatSubmitBtn = document.getElementById("chat-submit-button");
  mainChatInput.addEventListener("keyup", (e) => {
    console.log(mainChatInput.value);
    if (mainChatInput.value != "") chatSubmitBtn.removeAttribute("disabled");
    else chatSubmitBtn.setAttribute("disabled", true);
  });
});

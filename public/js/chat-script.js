document.addEventListener("DOMContentLoaded", (e) => {
  const mainChatInput = document.getElementById("main-chat-input");
  const chatSubmitBtn = document.getElementById("chat-submit-button");
  mainChatInput.addEventListener("keyup", (e) => {
    if (mainChatInput.value != "") chatSubmitBtn.removeAttribute("disabled");
    else chatSubmitBtn.setAttribute("disabled", true);
  });

  const emojiBtn = document.querySelector(".fa-smile");
  const emojiUl = document.getElementById("emoji-list");
  const emojiBox = document.getElementById("emoji-list-box");
  const searchEmoji = document.getElementById("search-emoji");

   

  emojiBtn.addEventListener("click", (e) => {
    emojiBox.classList.toggle("hide");

  });

//These functions are defined in emoji.js
  loadEmojis(emojiUl)
  filterEmojis(searchEmoji, emojiUl)
  closeEmojiBoxOnClick(emojiBtn, emojiBox)
  

  document.addEventListener("keydown", (e) => {
    if (event.keyCode == 27) {
      if (!Array.from(emojiBox.classList).includes("hide")) {
        emojiBox.classList.add("hide");
        mainChatInput.focus();
      }
    }
  });

  emojiUl.addEventListener("click", (e) => {
    if (e.target != emojiUl) {
      mainChatInput.value += e.target.innerText;
      searchEmoji.value = "";
      loadEmojis(emojiUl);
      if (mainChatInput.value != "") chatSubmitBtn.removeAttribute("disabled");
      else chatSubmitBtn.setAttribute("disabled", true);
      
    }
  });
});

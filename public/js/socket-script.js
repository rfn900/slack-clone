document.addEventListener("DOMContentLoaded", (e) => {
  const socket = io();
  const form = document.getElementById("main-chat-form");
  const chatInput = document.getElementById("main-chat-input");
  const messagesUl = document.getElementById("messages");
  const chatSubmitBtn = document.getElementById("chat-submit-button");
  const scrollDiv = document.querySelector(".chat_body__messages");
  console.log(currentUserId);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const roomId = window.location.pathname.split("/")[2];
    const payload = {
      content: chatInput.value,
      userId: currentUserId,
      roomId: roomId,
    };
    socket.emit("chat message", payload);

    chatInput.value = "";
    scrollDiv.scrollTop = scrollDiv.scrollHeight;
    chatSubmitBtn.setAttribute("disabled", "true");
    return false;
  });

  socket.on("chat message", (msg) => {
    const li = document.createElement("li");
    li.innerHTML = formatedMessage(msg);

    if (msg.newDay) {
      li.style.borderTop = "1px dotted #ccc";
      li.style.paddingTop = "20px";
    }
    messagesUl.appendChild(li);
    const emojiUl = document.getElementById(`${msg._id}-full-emoji-list`);
    const searchEmoji = document.getElementById(`${msg._id}-search-emoji`);
    const emojiDiv = document.getElementById(`${msg._id}-full-emoji-div`);
    const emojiBtn = document.getElementById(`${msg._id}-emoji-btn`).firstChild
      .firstChild;
    // console.log(emojiUl);
    filterEmojis(searchEmoji, emojiUl);
    closeEmojiBoxOnClick(emojiBtn, emojiDiv);
    // console.log(emojiBtn)
  });

  const formatedMessage = (msgObject) => {
    var { sender, body, profileImageSrc, hour, newDay, _id } = msgObject;
    const p = newDay ? `<p>${newDay}</p>` : "";
    const formatedContent = `${p}<div class="li-content" id="${_id}"><img src="${profileImageSrc}"/>
    <div class="message-container"><div class="message-header"><span class="message-sender">${sender}</span><span class="message-hour">${hour}</span></div> 
    <div class="message-content">${body}</div><div id="${_id}-reactions" class="emoji-list"></div></div>
    <div class="reaction-box">
      <span class="reaction-span" >${emojis.white_check_mark}</span>
      <span class="reaction-span" >${emojis.eyes}</span>
      <span class="reaction-span">${emojis.raised_hands}</span>
      <span id="${_id}-emoji-btn">${svgs.smiley}</span>
      <span>${svgs.bookmark}</span>
    </div>
    <div id="${_id}-full-emoji-div" class="hide emoji-box">
      <input type="text" class="search-emoji" id="${_id}-search-emoji" placeholder="Search emojis here"/>
      <ul id="${_id}-full-emoji-list" ></ul>
    </div>
    </div>
    `;

    return formatedContent;
  };

  messagesUl.addEventListener("click", async (e) => {
    const isClickFromEmojiElement = Array.from(e.target.classList).includes(
      "reaction-span"
    );
    const isClickToExpandEmojiList = Array.from(e.target.classList).includes(
      "emoji-list-button-svg"
    );

    if (isClickToExpandEmojiList) {
      let messageId = e.path[4].id.split("-")[0];
      let div = document.getElementById(`${messageId}-full-emoji-div`);
      let ul = document.getElementById(`${messageId}-full-emoji-list`);
      const emojiBtn = document.getElementById(`${messageId}-emoji-btn`)
        .firstChild.children[0];
      const searchEmoji = document.getElementById(`${messageId}-search-emoji`);
      console.log(emojiBtn == e.target);
      loadEmojis(ul);
      filterEmojis(searchEmoji, ul);
      closeEmojiBoxOnClick(emojiBtn, div);
      div.classList.toggle("hide");
    }

    if (isClickFromEmojiElement) {
      let messageId = e.path[2].id.split("-")[0];
      const data = {
        emoji: e.target.innerText.split(" ")[0],
        _id: messageId,
      };
      console.log(data);

      socket.emit("emoji", data);
    }
  });

  socket.on("emoji", (emojiObj) => {
    const { emoji, count, messageId } = emojiObj;

    const reactionDiv = document.getElementById(`${messageId}-reactions`);

    const allReactions = Array.from(reactionDiv.children);
    // console.log(allReactions);
    let foundReaction = false;
    allReactions.forEach((div) => {
      //Just add to count in case of an existing reaction-emoji
      console.log(div.innerText == `${emoji} ${count - 1}`);
      if (div.innerText == `${emoji} ${count - 1}`) {
        div.innerHTML = `<span class="reaction-span">${emoji} ${count}</span>`;

        foundReaction = true;
      }
    });
    console.log(foundReaction);
    if (!foundReaction)
      reactionDiv.innerHTML += `<div class="reaction-count"><span class="reaction-span reactions-display">${emoji} ${count}</span>`;
  });
});

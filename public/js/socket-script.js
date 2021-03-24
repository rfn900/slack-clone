document.addEventListener("DOMContentLoaded", (e) => {
  const socket = io();
  const form = document.getElementById("main-chat-form");
  const chatInput = document.getElementById("main-chat-input");
  const messagesUl = document.getElementById("messages");
  const chatSubmitBtn = document.getElementById("chat-submit-button");

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
    li.innerHTML = formatedMessage(msg);

    if (msg.newDay) {
      li.style.borderTop = "1px dotted #ccc";
      li.style.paddingTop = "20px";
    }
    messagesUl.appendChild(li);
    const emojiUl = document.getElementById(`${msg._id}-full-emoji-list`)
    const searchEmoji = document.getElementById(`${msg._id}-search-emoji`)
    const emojiDiv = document.getElementById(`${msg._id}-full-emoji-div`)
    const emojiBtn = document.getElementById(`${msg._id}-emoji-btn`).firstChild.firstChild
    loadEmojis(emojiUl)
    filterEmojis(searchEmoji, emojiUl)
    closeEmojiBoxOnClick(emojiBtn, emojiDiv)
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
     console.log(messagesUl.children[0].children)
      document.getElementById(`${messageId}-full-emoji-div`).classList.toggle("hide")
    }

    if (isClickFromEmojiElement) {
      let messageId = e.path[2].id.split("-")[0];

      const data = {
        emoji: e.target.innerText.split(" ")[0],
        _id: messageId,
      };

      await fetch("http://localhost:3000/messages/reaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
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
      if (div.firstChild.innerText == `${emoji} ${count - 1}`) {
        div.firstChild.innerText = `${emoji} ${count}`;
        foundReaction = true;
      }
    });
    // console.log(foundReaction);
    if (!foundReaction)
      reactionDiv.innerHTML += `<div class="reaction-count"><span class="reaction-span reactions-display">${emoji} ${count}</span>`;
  });

  
});

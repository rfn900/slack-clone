document.addEventListener("DOMContentLoaded", (e) => {
  const socket = io();
  const form = document.getElementById("main-chat-form");
  const chatInput = document.getElementById("main-chat-input");
  const messagesUl = document.getElementById("messages");
  const chatSubmitBtn = document.getElementById("chat-submit-button");
  let editBtn = Array.from(document.getElementsByClassName("edit-icon"));
  const mentionBtn = document.getElementById("mentions-span");
  const deleteBtn = Array.from(document.getElementsByClassName("delete-icon"));
  console.log(username, room);
  const mentionsBox = document.getElementById("mentions-box");

  const ul = document.createElement("ul");
  const mentionsResult = document.getElementById("mentions-results");

  mentionBtn.addEventListener("click", (e) => {
    mentionsBox.classList.toggle("hide");
  });
  document
    .getElementById("mentions-input")
    .addEventListener("keyup", async (e) => {
      if (e.target.value.length >= 3) {
        ul.innerHTML = "";
        const res = await fetch(`/users/${e.target.value}`);
        const data = await res.json();
        data.forEach((entry) => {
          console.log(entry);
          const li = document.createElement("li");
          li.innerHTML = `@${entry.name}`;
          li.style.color = "darkblue";
          li.className = "mention-li";
          li.setAttribute("name", `mention-${entry.name}`);
          li.setAttribute("_id", `${entry._id}`);
          ul.appendChild(li);
        });
        mentionsBox.appendChild(ul);
      }
    });
  ul.addEventListener("click", (e) => {
    console.log(e.target.classList);

    if (Array.from(e.target.classList).includes("mention-li")) {
      const name = e.target.getAttribute("name").split("-")[1];
      const mentionedId = e.target.getAttribute("_id");
      if (!mentionsResult.innerText.includes(name))
        mentionsResult.innerHTML += `<span _id="${mentionedId}">@${name}</span>`;
      document.getElementById("mentions-input").value = "";
      ul.innerHTML = "";
      mentionsBox.classList.add("hide");
    }
  });

  socket.emit("join room", { username, currentUserId, room, roomId });
  const scrollDiv = document.getElementById("messages-container");
  scrollDiv.scrollTop = scrollDiv.scrollHeight;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const roomId = window.location.pathname.split("/")[2];
    const mentions = Array.from(mentionsResult.children).map((mention) =>
      mention.getAttribute("_id")
    );

    mentionsResult.innerHTML = "";
    const payload = {
      content: chatInput.value,
      userId: currentUserId,
      roomId: roomId,
      mentions,
    };
    socket.emit("chat message", payload);

    chatInput.value = "";
    chatSubmitBtn.setAttribute("disabled", "true");
    editBtn = Array.from(document.getElementsByClassName("edit-icon"));
    return false;
  });

  socket.on("chat message", (msg) => {
    const li = document.createElement("li");
    li.innerHTML = formatedMessage(msg, currentUserId);

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
    const scrollDiv = document.getElementById("messages-container");
    scrollDiv.scrollTop = scrollDiv.scrollHeight;

    filterEmojis(searchEmoji, emojiUl);
    closeEmojiBoxOnClick(emojiBtn, emojiDiv);
  });

  const formatedMessage = (msgObject, currentUserId) => {
    var {
      senderId,
      sender,
      body,
      mentions,
      contentType,
      profileImageSrc,
      hour,
      newDay,
      _id,
    } = msgObject;

    mentions.forEach((mention) => {
      if (contentType == "text")
        body += `    <span style="color: darkblue">@${mention}</span>`;
    });
    console.log(senderId, currentUserId);
    const p = newDay ? `<p>${newDay}</p>` : "";
    const formatedContent = `${p}<div class="li-content" id="${_id}"><img src="${profileImageSrc}"/>
    <div  class="message-container"><div class="message-header"><span class="message-sender">${sender}</span><span class="message-hour">${hour}</span></div> 
    <div id="${_id}-content" class="message-content">${
      contentType == "text"
        ? body
        : `<img src="https://rod-app-bucket.s3.eu-north-1.amazonaws.com/${body}" class="user-upload" alt="chat image"/>`
    }</div><div id="${_id}-reactions" class="emoji-list"></div></div>
    <div class="reaction-box">
      <span class="reaction-span" >${emojis.white_check_mark}</span>
      <span class="reaction-span" >${emojis.eyes}</span>
      <span class="reaction-span">${emojis.raised_hands}</span>
      <span id="${_id}-emoji-btn">${svgs.smiley}</span>
      <span class="${senderId == currentUserId ? "" : "hide"}" _id="${_id}">
        <img class="edit-icon" style="width: 20px; object-fit:contain;" src="../images/edit.png" _id="${_id}"/>
      </span>
      <span class="${senderId == currentUserId ? "" : "hide"}" _id="${_id}">
        <img class="delete-icon" style="width: 20px; object-fit:contain;" src="../images/trashcan.png" _id="${_id}"/>
      </span>
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
    const isClickToEdit = Array.from(e.target.classList).includes("edit-icon");

    const isClickToDelete = Array.from(e.target.classList).includes(
      "delete-icon"
    );

    if (isClickToDelete) {
      const messageId = e.target.getAttribute("_id");
      var r = confirm("Are you sure you want to delete this message?");
      if (r) {
        await fetch(`/message/delete/${messageId}`, {
          method: "POST",
        });
        window.location.reload();
      }
    }

    if (isClickToEdit) {
      const messageId = e.target.getAttribute("_id");

      const content = document.getElementById(`${messageId}-content`).innerText;
      const contentWidth = document.getElementById(`${messageId}-content`)
        .offsetWidth;
      const contentHeight = document.getElementById(`${messageId}-content`)
        .offsetHeight;
      document.getElementById(
        `${messageId}-content`
      ).innerHTML = `<form method="post" action="/message/edit/${messageId}"><textarea name="messageEdit">${content}</textarea><input type="submit"/><a href="./${roomId}">Cancel</a></form>`;
    }

    if (isClickToExpandEmojiList) {
      let messageId = e.path[4].id.split("-")[0];
      let div = document.getElementById(`${messageId}-full-emoji-div`);
      let ul = document.getElementById(`${messageId}-full-emoji-list`);
      let li = document.getElementById(`${messageId}`);
      const emojiBtn = document.getElementById(`${messageId}-emoji-btn`)
        .firstChild.children[0];
      const searchEmoji = document.getElementById(`${messageId}-search-emoji`);
      console.log(emojiBtn == e.target);
      loadEmojis(ul);
      filterEmojis(searchEmoji, ul);
      closeEmojiBoxOnClick(emojiBtn, div);
      div.classList.toggle("hide");

      li.addEventListener("mouseleave", () => {
        div.classList.add("hide");
      });
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

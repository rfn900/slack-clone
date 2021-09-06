document.addEventListener("DOMContentLoaded", (e) => {
  const caretIconSpan = document.querySelectorAll(".caret-icon-span");
  const channelList = document.querySelectorAll(".channel__list");
  const toggleTitle = document.querySelectorAll(".toggle-title");
  const toggleH3 = document.querySelector(".toggle-h3");
  const channelListItem = Array.from(
    document.querySelectorAll(".channel__list__item")
  );

  channelListItem.map((item) => {
    const linkHref = getLastParamOfUrl(item.firstChild.getAttribute("href"));
    const roomId = getLastParamOfUrl(window.location.href);
    linkHref === roomId
      ? item.classList.add("active")
      : item.classList.remove("active");
  });
  // These event listeners apply to sidebar elements
  toggleTitle.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      caretIconSpan[index].classList.toggle("rotate");
      channelList[index].classList.toggle("hide");
      if (index == 0) toggleH3.classList.toggle("active");
    });
  });

  // These event listeners apply to header elements
  const profileToggle = document.querySelector(".profile-toggle");
  const logoutBox = document.querySelector(".logout-box");
  profileToggle.addEventListener("click", (e) => {
    logoutBox.classList.toggle("hide");
  });

  document.addEventListener("click", (e) => {
    if (!e.path.includes(logoutBox) && !e.path.includes(profileToggle)) {
      logoutBox.classList.add("hide");
    }
  });

  function getLastParamOfUrl(url) {
    return url.split("/")[url.split("/").length - 1];
  }
});

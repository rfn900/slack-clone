document.addEventListener("DOMContentLoaded", (e) => {
  const caretIconSpan = document.querySelectorAll(".caret-icon-span");
  const channelList = document.querySelectorAll(".channel__list");
  const toggleTitle = document.querySelectorAll(".toggle-title");
  const toggleH3 = document.querySelector(".toggle-h3");

  toggleTitle.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      caretIconSpan[index].classList.toggle("rotate");
      channelList[index].classList.toggle("hide");
      if (index == 0) toggleH3.classList.toggle("active");
    });
  });
});


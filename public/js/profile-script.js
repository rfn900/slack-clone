document.addEventListener("DOMContentLoaded", (e) => {
  const editLinks = document.querySelectorAll(".edit-profile-link");

  editLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const liParent = e.path[1];
      const form = document.createElement("form");
      form.setAttribute("method", "post");
      form.setAttribute("action", "/users/edit");
      const textInput = document.createElement("input");

      const inputName = liParent.children[0].innerText
        .toLowerCase()
        .slice(0, -1);

      inputName === "name"
        ? textInput.setAttribute("type", "text")
        : textInput.setAttribute("type", "email");

      const submit = document.createElement("input");
      submit.setAttribute("type", "submit");
      form.appendChild(textInput);
      form.appendChild(submit);
      const cancelLink = document.createElement("a");
      cancelLink.innerText = "Cancel";
      cancelLink.setAttribute("href", "/profile");
      cancelLink.id = "cancel-link";

      textInput.setAttribute("name", inputName);
      textInput.setAttribute("required", true);

      // console.log(liParent.children[1].innerText);
      //textInput.value = liParent.children[1].innerText;
      textInput.setAttribute("placeholder", liParent.children[1].innerText);
      liParent.innerHTML = "";
      form.appendChild(cancelLink);
      liParent.appendChild(form);
      liParent.style.padding = "0";
    });
  });
});

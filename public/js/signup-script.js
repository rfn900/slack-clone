document.addEventListener("DOMContentLoaded", (e) => {
  const signupForm = document.getElementById("signupForm");
  const inputSubmit = document.getElementById("input-submit");
  const inputFields = Array.from(signupForm.children).filter(
    (input) => input.type != "submit"
  );

  inputFields.forEach((input, index, inputArr) => {
    input.addEventListener("keyup", (e) => {
      const emptyInputs = inputArr.filter((ipt) => ipt.value == "");
      const password = inputArr[2].value;
      const passwordConfirmation = inputArr[3].value;
      const passwordTest = password == passwordConfirmation ? true : false;

      if (emptyInputs.length == 0 && passwordTest) {
        inputSubmit.disabled = false;
      } else inputSubmit.disabled = true;
    });
  });
});

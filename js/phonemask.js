document.addEventListener("DOMContentLoaded", function() {
  const mask = (event) => {
    const input = event.target;
    const matrix = "+7 (___) ___ ____";
    const keyCode = event.keyCode;

    if (input.selectionStart < 3 && event.keyCode) {
      event.preventDefault();
    }

    let val = input.value.replace(/\D/g, "");
    let i = 0;

    const new_value = matrix.replace(/[_\d]/g, a => i < val.length ? val.charAt(i++) || def.charAt(i) : a);
    i = new_value.indexOf("_");

    if (i != -1) {
      if (i < 5) i = 3;
      val = new_value.slice(0, i);
    }

    const reg = new RegExp("^" + matrix.substr(0, input.value.length).replace(/_+/g, a => "\\d{1," + a.length + "}").replace(/[+()]/g, "\\$&") + "$");

    if (!reg.test(input.value) || input.value.length < 5 || keyCode > 47 && keyCode < 58) {
      input.value = new_value;
    }
    if (event.type == "blur" && input.value.length < 5) {
      input.value = "";
    }
  }

  document.querySelectorAll('.tel').forEach(input => {
    ["input", "focus", "blur", "keydown"].forEach(event => {
      input.addEventListener(event, mask, false);
    });
  });
});

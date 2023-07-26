$(document).ready(function () {
  var url = 'https://api.callofthehunt.com/v1/mailing';

  function displayValidationError(inputId, message) {
    const validationElement = $(`#${inputId}`).parent('div').find('.input-validation');
    validationElement.text(message);
  }

  $("#email-form input[type='submit']").click(function (e) {
    e.preventDefault();
    var name = $('#name').val();
    var email = $('#Email').val();
    var isValid = true;

    if (name) {
      displayValidationError('name', "");
    } else {
      displayValidationError('name', "введите имя");
      isValid = false;
    }

    if (email && /@/.test(email)) {
      displayValidationError('Email', "");
    } else {
      displayValidationError('Email', "введите email");
      isValid = false;
    }

    if (!isValid) {
      $('.submit-validation').text("не все поля заполнены");
      return;
    }

    // отправка на бек
    $('.submit-validation').text("");

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        'email': email,
        'name': name
      })
    })
    .then(response => response.json())
    .then(result => {
      $('#name').val("");
      $('#Email').val("");
      $(".mailing-form-done").fadeIn();
    })
    .catch(err => console.log(err));
  });
});

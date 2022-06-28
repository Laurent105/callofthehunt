$(document).ready(function () {
  var url = 'https://api.callofthehunt.com/v1/mailing';

  $("#email-form input[type='submit']").click(function (e) {
    e.preventDefault();
    var name = $('#name').val();
    var email = $('#Email').val();

    isValide = true;
    if (name) {
      $('#name').parent('div').find('.input-validation').text("");
    } else {
      $('#name').parent('div').find('.input-validation').text("введите имя");
      isValide = false;
    }

    if (email && /@/.test(email)) {
      $('#Email').parent('div').find('.input-validation').text("");
    } else {
      $('#Email').parent('div').find('.input-validation').text("введите email");
      isValide = false;
    }

    if (!isValide) {
      $('.submit-validation').text("не все поля заполнены");
    } else {
      // отправка на бек
      $('.submit-validation').text("");
// console.log(444);
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          'email': email,
          'name': name
        })
      }).then(response => response.json())
        .then(result => {
          $('#name').val("");
          $('#Email').val("");
          $(".mailing-form-done").fadeIn();
        });
    }
  });
});

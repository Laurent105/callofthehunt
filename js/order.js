$(document).ready(function () {
  if (typeof gtag !== 'undefined') gtag('event', 'cart', {});
  const url = 'http://api.callofthehunt.com';
  const urlSend = url + '/v1/orders';
  const urlCourierCost = url + '/v1/sdek/cost-courier';
  const urlWidget = url + '/v1/sdek/widget';
  const urlCityList = 'https://api.cdek.ru/city/getListByTerm/jsonp.php';

  var data = {
    type: "pickup",
    qty: 1,
    ga_client_id: "",
    pickup: {
      cost: 0,
      city_id: "",
      pickup_id: "",
      shipping_method: 0, // необязательный
      address: ""
    },
    courier: {
      cost: 0,
      city_id: "",
      shipping_method: 0, // необязательный, не используется
      address: ""
    }
  };

  const gclidPromise = new Promise(resolve => {
    if (typeof gtag !== 'undefined') gtag('get', 'G-QQ1KK3HS17', 'client_id', resolve)
  });
  gclidPromise.then((gclid) => {
    data.ga_client_id = gclid;
  });

  // виджет карты пвз для самовывоза
  var ourWidjet = new ISDEKWidjet ({
    defaultCity: 'Москва', // auto //какой город отображается по умолчанию
    cityFrom: 'Москва', // из какого города будет идти доставка
    country: 'Россия', // можно выбрать страну, для которой отображать список ПВЗ
    link: 'shiptor_widget_pvz', // id элемента страницы, в который будет вписан виджет
    hidecash: true,
    hidedress: true,
    choose: true,
    hidedelt: true,
    // detailAddress: true,
    // apikey: '',
    mode: 'all',
    goods: [{
      length: 27,
      width: 27,
      height: 6,
      weight: 0.65
    }],
    onChoose: onChoose,
    onCalculate: onCalculate,
    //path: '/assets/sdek_widget/scripts/', // директория с библиотеками
    servicepath: urlWidget // ссылка на файл service.php на вашем сайте
  });

  function onChoose(params) {
    text = '<div class="shiptor_selected_pvz__wrap">\n' +
      '                <div class="shiptor_selected_pvz__courier">' + params.id + '</div>\n' +
      '                <div class="shiptor_selected_pvz__address">г. '+ params.cityName +', '+ params.PVZ.Address +'</div>\n' +
      '                <div class="shiptor_selected_pvz__cost">'+ params.price +' руб.</div>\n' +
      '                <div class="shiptor_selected_pvz__shipping_days">'+ params.term +' рабочий день</div>\n' +
      '                <div class="shiptor_selected_pvz__work_shedule_formatted">'+ params.PVZ.WorkTime +'</div>\n' +
      '                <div class="shiptor_selected_pvz__change button w-button">изменить</div>\n' +
      '              </div>';
    $('.shiptor_selected_pvz').html(text);
    $('#shiptor_widget_pvz').fadeOut(0);

    data.pickup.pickup_id = params.id;
    data.pickup.city_id = parseInt(params.city);
    data.pickup.shipping_method = params.tarif;
    data.pickup.address = params.PVZ.Address;
  }

  function onCalculate(params) {
    cost = Number(params.profiles.pickup.price);
    $('.cost-delivery').text(cost);
    if ($('.shiptor_selected_pvz__cost').length) $('.shiptor_selected_pvz__cost').text(cost + ' руб.');
    data.pickup.cost = cost;
    cartSum();
  }

  // выбор доставки
  $('.btn-delivery[data-type="1"]').click();
  $('.btn-delivery').click(function () {
    if ($(this).data('type') === 1) {
      // самовывоз
      if (!$('.shiptor_selected_pvz__wrap').length) {
        $('#shiptor_widget_pvz').fadeIn(0);
      }
      $('.form_courier').fadeOut(0);
      $('.shiptor_selected_pvz').fadeIn(0);

      $('.cost-delivery').text(data.pickup.cost);
      cartSum();
      data.type = "pickup";
    } else {
      // доставка курьером
      if (!$('.shiptor_selected_pvz__wrap').length) {
        $('#shiptor_widget_pvz').fadeOut(0);
      }
      $('.form_courier').fadeIn(0);
      $('.shiptor_selected_pvz').fadeOut(0);

      $('.cost-delivery').text(data.courier.cost);
      cartSum();
      data.type = "courier";
    }
  });

  $('body').on('click', '.shiptor_selected_pvz__change', function () {
    data.pickup.city_id = "";
    data.pickup.pickup_id = "";
    $('.shiptor_selected_pvz').html("");
    $('#shiptor_widget_pvz').fadeIn(0);
  });

  // ввод города
  $('#City-2').on('input', function () {
    data.courier = {
      cost: 0,
      city_id: "",
      shipping_method: 0,
      address: ""
    };

    let val = $(this).val();
    $.ajax({
      url: urlCityList,
      dataType: "jsonp",
      data:  {q: val},
      success: function(result){
        var html = "";
        if (result.geonames && result.geonames.length) {
          result.geonames.map(function(item) {
            if (item.countryId === "1") {
              html += '<li class="city-data-list__item" data-id="'+ item.id +'">'+ item.name +'</li>';
            }
          });
        }
        $('.city-data-list').html(html);
      }
    });
  });
  $('body').on('click', '.city-data-list__item', function () {
    $('#City-2').val($(this).text());
    $('.city-data-list').html("");

    data.courier.city_id = $(this).data('id');
    getCostCourier(Number($('.h2-quantity').text()));
  });

  function getCostCourier(qty) {
    $('.cost-delivery').text(0);
    if (data.courier.city_id) {
      fetch(urlCourierCost + '?qty=' + qty + '&cityId=' + data.courier.city_id, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        }
      }).then(response => response.json())
        .then(result => {
          if (!result[0]) {
            $('#City-2').parent('div').find('.input-validation').text("доставка невозможна");
          } else {
            $('#City-2').parent('div').find('.input-validation').text("");
            // data.courier.shipping_method = result[0];
            data.courier.cost = result[1];
            $('.cost-delivery').text(result[1]);
            setTimeout(function () {
              cartSum();
            }, 500);
          }
        });
    } else {
      $('.cost-delivery').text(0);
      setTimeout(function () {
        cartSum();
      }, 500);
    }
  }

  // изменение кол-ва товара
  $('.button-quantity-minus').click(function () {
    qty = Number($('.h2-quantity').text());
    if (qty > 1) {
      qty--;
      $('.h2-quantity').text(qty);
      $('.cost-items').text(1800 * qty);
      // cartSum();
      if (data.type === "pickup") getCostPvz(qty);
      if (data.type === "courier") getCostCourier(qty);
      data.qty = qty;
    }
  });
  $('.button-quantity-plus').click(function () {
    qty = Number($('.h2-quantity').text());
    if (qty < 1000) {
      qty++;
      $('.h2-quantity').text(qty);
      $('.cost-items').text(1800 * qty);
      // cartSum();
      if (data.type === "pickup") getCostPvz(qty);
      if (data.type === "courier") getCostCourier(qty);
      data.qty = qty;
    }
  });

  // изменение веса и габаритов посылки - обновление стоимости доставки
  function getCostPvz(qty) {
    ourWidjet.cargo.reset();
    for (i = 0; i < qty; i++) {
      ourWidjet.cargo.add ({
        length: 27,
        width: 27,
        height: 6,
        weight: 0.65
      });
    }
  }

  // пересчет всей корзины
  function cartSum() {
    sum = Number($('.cost-items').text()) + Number($('.cost-delivery').text()) + Number($('.cost-discount').text());
    $('.cost-sum').text(sum);
  }

  // оформление заказа
  $('.submit-order-form').click(function (e) {
    e.preventDefault();

    var params = data;
    params.name = $('#name').val();
    params.phone = $('#Phone').val();
    params.email = $('#Email').val();

    params.courier.postcode = $('#ZIP-2').val();
    params.courier.city = $('#City-2').val();
    params.courier.address = $('#Address').val();
    params.courier.fullAddress = params.courier.city + ", " + params.courier.address;
    params.courier.comment = $('#Comment').val();

    isValide = true;
    if (params.name) {
      $('#name').parent('div').find('.input-validation').text("");
    } else {
      $('#name').parent('div').find('.input-validation').text("введите имя");
      isValide = false;
    }

    params.phone = params.phone.replace(/[\s()]/g, "");
    if (params.phone && /(\+7)\d{10}/.test(params.phone)) {
      $('#Phone').parent('div').find('.input-validation').text("");
    } else {
      $('#Phone').parent('div').find('.input-validation').text("введите телефон");
      isValide = false;
    }

    if (params.email && /@/.test(params.email)) {
      $('#Email').parent('div').find('.input-validation').text("");
    } else {
      $('#Email').parent('div').find('.input-validation').text("введите email");
      isValide = false;
    }

    if (params.type === 'courier') {
      if (params.courier.city && params.courier.city_id) {
        $('#City-2').parent('div').find('.input-validation').text("");
      } else {
        $('#City-2').parent('div').find('.input-validation').text("введите город");
        isValide = false;
      }

      if (params.courier.address) {
        $('#Address').parent('div').find('.input-validation').text("");
      } else {
        $('#Address').parent('div').find('.input-validation').text("введите адрес");
        isValide = false;
      }
    } else {
      if (params.pickup.pickup_id && params.pickup.city_id) {
        $('.shiptor_widget-validation').text("");
      } else {
        $('.shiptor_widget-validation').text("выберите пункт выдачи");
        isValide = false;
      }
    }

    if (!isValide) {
      $('.submit-validation').text("не все поля заполнены");
    } else {
      // отправка на бек
      $('.submit-validation').text("");

      var windowReference = window.open();

      fetch(urlSend, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(params)
      }).then(response => response.json())
        .then(result => {
          localStorage.setItem('ordercompleted', 1);
          if (typeof gtag !== 'undefined') gtag('event', 'sendForm', {});
          if (typeof _tmr !== 'undefined') _tmr.push({ type: "reachGoal", id: 3267947, value: "0", goal: "pay", params: { product_id: "1"}});
          windowReference.location = result;
        });
    }
  });
});

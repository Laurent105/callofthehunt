$(document).ready(function () {
  if (typeof gtag !== 'undefined') gtag('event', 'cart', {});
  url = 'https://api.callofthehunt.com/v1/orders';

  var data = {
    type: "pickup",
    qty: 1,
    ga_client_id: "",
    pickup: {
      cost: 0,
      kladr_id: "",
      delivery_point: 0,
      shipping_method: 0,
      address: ""
    },
    courier: {
      cost: 0,
      kladr_id: "",
      shipping_method: 0,
      address: ""
    }
  };

  const gclidPromise = new Promise(resolve => {
    if (typeof gtag !== 'undefined') gtag('get', 'G-QQ1KK3HS17', 'client_id', resolve)
  });
  gclidPromise.then((gclid) => {
    data.ga_client_id = gclid;
  });

  // выбор доставки
  $('.btn-delivery[data-type="1"]').click();
  $('.btn-delivery').click(function () {
    if ($(this).data('type') === 1) {
      // самовывоз
      if (!$('.shiptor_selected_pvz__wrap').length) {
        window.JCShiptorWidgetPvz.show();
      }
      $('.form_courier').fadeOut(0);
      $('.shiptor_selected_pvz').fadeIn(0);

      $('.cost-delivery').text(data.pickup.cost);
      cartSum();
      data.type = "pickup";
    } else {
      // доставка курьером
      if (!$('.shiptor_selected_pvz__wrap').length) {
        window.JCShiptorWidgetPvz.hide();
      }
      $('.form_courier').fadeIn(0);
      $('.shiptor_selected_pvz').fadeOut(0);

      $('.cost-delivery').text(data.courier.cost);
      cartSum();
      data.type = "courier";
    }
  });

  $('body').on('click', '.shiptor_selected_pvz__change', function () {
    $('.shiptor_selected_pvz').html("");
    window.JCShiptorWidgetPvz.show();
  });

  // выбор пвз
  var elemShiptorWidget = document. querySelector("#shiptor_widget_pvz");
  elemShiptorWidget.addEventListener ("onPvzSelect", function(ce) {
    text = '<div class="shiptor_selected_pvz__wrap">\n' +
      '                <div class="shiptor_selected_pvz__courier">'+ ce.detail.courier +'</div>\n' +
      '                <div class="shiptor_selected_pvz__address">'+ ce.detail.address +'</div>\n' +
      '                <div class="shiptor_selected_pvz__cost">'+ ce.detail.cost +'</div>\n' +
      '                <div class="shiptor_selected_pvz__shipping_days">'+ ce.detail.shipping_days +'</div>\n' +
      '                <div class="shiptor_selected_pvz__work_shedule_formatted">'+ ce.detail.work_shedule_formatted +'</div>\n' +
      '                <div class="shiptor_selected_pvz__change button w-button">изменить</div>\n' +
      '              </div>';
    $('.shiptor_selected_pvz').html(text);

    cost = Number(ce.detail.cost.replace(" руб.", ""));
    $('.cost-delivery').text(cost);
    cartSum();
    data.pickup.cost = cost;
    data.pickup.delivery_point = ce.detail.id;
    data.pickup.kladr_id = ce.detail.kladr_id;
    data.pickup.shipping_method = ce.detail.shipping_method;
    data.pickup.address = ce.detail.address;
  });
  elemShiptorWidget.addEventListener ("onGetPvzList", function(ce){
    $('._shiptor_widget_settlement').val("");
  });

  // ввод города
  $('#City-2').on('input', function () {
    data.courier.kladr_id = "";

    let params = {
      "id": "JsonRpcClient.js",
      "jsonrpc": "2.0",
      "method": "suggestSettlement",
      "params": {
        "query": $(this).val(),
        "country_code": "RU"
      }
    };

    fetch('https://api.shiptor.ru/public/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(params)
    }).then(response => response.json())
      .then(result => {
        var html = "";
        result.result.map(function(item) {
          if (item.type === "город" || item.type === "поселок") {
            html += '<li class="city-data-list__item" data-kladr="'+ item.kladr_id +'">'+ item.name +', '+ item.readable_parents +'</li>';
          }
        });
        $('.city-data-list').html(html);
      });
  });
  $('body').on('click', '.city-data-list__item', function () {
    $('#City-2').val($(this).text());
    $('.city-data-list').html("");
    data.courier.kladr_id = String($(this).data('kladr'));

    getCostCourier(Number($('.h2-quantity').text()));
  });

  function getCostCourier(qty) {
    $('.cost-delivery').text(0);
    if (data.courier.kladr_id) {
      var a = Math.pow(27*27*6 * qty, 1/3);
      let params = {
        "id": "JsonRpcClient.js",
        "jsonrpc": "2.0",
        "method": "calculateShipping",
        "params": {
          "stock": true,
          "kladr_id_from": "77000000000",
          "kladr_id": data.courier.kladr_id,
          "length": a,
          "width": a,
          "height": a,
          "weight": 0.65 * qty,
          "cod": 0,
          "declared_cost": 0,
          "country_code": "RU"
        }
      };

      fetch('https://api.shiptor.ru/public/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(params)
      }).then(response => response.json())
        .then(result => {
          var isFind = result.result.methods.some(function(item) {
            if (item.method.category === "to-door" && item.method.courier === "sber_courier") {
              data.courier.shipping_method = item.method.id;
              data.courier.cost = Math.ceil(item.cost.services[0].sum/100)*100;
              $('.cost-delivery').text(data.courier.cost);
              cartSum();
              return true;
            }
            return false;
          });
          if (!isFind) {
            $('#City-2').parent('div').find('.input-validation').text("доставка невозможна");
          } else {
            $('#City-2').parent('div').find('.input-validation').text("");
          }
        });
    } else {
      $('.cost-delivery').text(0);
      cartSum();
    }
  }

  // изменение кол-ва товара
  $('.button-quantity-minus').click(function () {
    qty = Number($('.h2-quantity').text());
    if (qty > 1) {
      qty--;
      $('.h2-quantity').text(qty);
      $('.cost-items').text(1800 * qty);
      cartSum();
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
      cartSum();
      if (data.type === "pickup") getCostPvz(qty);
      if (data.type === "courier") getCostCourier(qty);
      data.qty = qty;
    }
  });

  // изменение веса и габаритов посылки - обновление стоимости доставки
  function getCostPvz(qty) {
    data.pickup = {
      cost: 0,
      kladr_id: "",
      delivery_point: 0,
      shipping_method: 0,
      address: ""
    };

    var a = Math.pow(27*27*6 * qty, 1/3);
    window.JCShiptorWidgetPvz.setParams({
      weight: 0.65 * qty,
      dimensions: {
        length: a,
        width: a,
        height: a
      }
    });
    $('.shiptor_selected_pvz__change').click();
    $('.cost-delivery').text(0);
    cartSum();
    window.JCShiptorWidgetPvz.refresh();
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
      if (params.courier.city && params.courier.shipping_method && params.courier.kladr_id) {
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
      if (params.pickup.delivery_point && params.pickup.kladr_id) {
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

      fetch(url, {
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

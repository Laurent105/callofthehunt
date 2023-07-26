$(document).ready(function () {
  const urls = {
    base: 'https://api.callofthehunt.com',
    send: '/v1/orders',
    courierCost: '/v1/sdek/cost-courier',
    widget: '/v1/sdek/widget',
    cityList: 'https://api.cdek.ru/city/getListByTerm/jsonp.php'
  };

  const data = initOrderData();

  getGoogleClientId().then((gclid) => {
    data.ga_client_id = gclid;
  });

  const ourWidget = initWidget(urls.widget, data);

  initEventHandlers(data, ourWidget, urls);

  function initOrderData() {
    return {
      type: "pickup",
      qty: 1,
      ga_client_id: "",
      pickup: {
        cost: 0,
        city_id: "",
        pickup_id: "",
        shipping_method: 0,
        address: ""
      },
      courier: {
        cost: 0,
        city_id: "",
        shipping_method: 0,
        address: ""
      }
    };
  }

  function getGoogleClientId() {
    return new Promise(resolve => {
      if (typeof gtag !== 'undefined') gtag('get', 'G-QQ1KK3HS17', 'client_id', resolve)
    });
  }

  function initWidget(urlWidget, data) {
    return new ISDEKWidjet ({
      defaultCity: 'Москва',
      cityFrom: 'Москва',
      country: 'Россия',
      link: 'shiptor_widget_pvz',
      hidecash: true,
      hidedress: true,
      choose: true,
      hidedelt: true,
      mode: 'all',
      goods: getGoodsData(),
      onChoose: (params) => onChoose(params, data),
      onCalculate: (params) => onCalculate(params, data),
      servicepath: urlWidget
    });
  }

  function getGoodsData() {
    return [{
      length: 27,
      width: 27,
      height: 6,
      weight: 0.65
    }];
  }

  function initEventHandlers(data, ourWidget, urls) {
    setDeliveryType(data, 1);
    handleDeliveryTypeChange(data, ourWidget);
    handlePvzChange(data);
    handleCityInput(data, urls.cityList);
    handleCitySelection(data);
    handleQuantityChange(data, ourWidget);
    handleOrderSubmit(data, urls.base + urls.send);
  }

  function setDeliveryType(data, type) {
    $('.btn-delivery[data-type="' + type + '"]').click();
  }

  function handleDeliveryTypeChange(data, ourWidget) {
    $('.btn-delivery').click(function () {
      let type = $(this).data('type');
      if (type === 1) handlePickupDelivery(data);
      else handleCourierDelivery(data);
    });
  }

  function handlePickupDelivery(data) {
    showElement('#shiptor_widget_pvz');
    hideElement('.form_courier');
    showElement('.shiptor_selected_pvz');
    updateCost(data.pickup.cost);
    data.type = "pickup";
  }

  function handleCourierDelivery(data) {
    hideElement('#shiptor_widget_pvz');
    showElement('.form_courier');
    hideElement('.shiptor_selected_pvz');
    updateCost(data.courier.cost);
    data.type = "courier";
  }

  function showElement(selector) {
    $(selector).fadeIn(0);
  }

  function hideElement(selector) {
    $(selector).fadeOut(0);
  }

  function updateCost(cost) {
    $('.cost-delivery').text(cost);
    updateCartSum();
  }

  function handlePvzChange(data) {
    $('body').on('click', '.shiptor_selected_pvz__change', function () {
      clearPickupData(data);
      showElement('#shiptor_widget_pvz');
    });
  }

  function clearPickupData(data) {
    data.pickup.city_id = "";
    data.pickup.pickup_id = "";
    $('.shiptor_selected_pvz').html("");
  }

  function handleCityInput(data, urlCityList) {
    $('#City-2').on('input', function () {
      resetCourierData(data);
      requestCityData($(this).val(), urlCityList);
    });
  }

  function resetCourierData(data) {
    data.courier = {
      cost: 0,
      city_id: "",
      shipping_method: 0,
      address: ""
    };
  }

  function requestCityData(val, urlCityList) {
    $.ajax({
      url: urlCityList,
      dataType: "jsonp",
      data:  {q: val},
      success: updateCityList
    });
  }

  function updateCityList(result) {
    var html = "";
    if (result.geonames && result.geonames.length) {
      html = generateCityListHTML(result.geonames);
    } else {
      html = "<li>Ничего не найдено</li>";
    }
    $("#City-list").html(html);
  }

  function generateCityListHTML(cities) {
    return cities.map(city => `<li data-id="${city.id}">${city.name}</li>`).join('');
  }

  function handleCitySelection(data) {
    $('#City-list').on('click', 'li', function () {
      $('#City-2').val($(this).text());
      data.courier.city_id = $(this).data('id');
      $('#City-list').html('');
    });
  }

  function handleQuantityChange(data, ourWidget) {
    $('.qty').change(function () {
      data.qty = $(this).val();
      ourWidget.setQty(data.qty);
    });
  }

  function handleOrderSubmit(data, urlSend) {
    $('#Order').submit(function (e) {
      e.preventDefault();
      $.ajax({
        url: urlSend,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (data) {
          if (data.success) {
            $('.modal-title').text('Заказ оформлен');
            $('.modal-body').html('Ваш заказ успешно оформлен. Номер вашего заказа: ' + data.order_id);
            $('#Order')[0].reset();
            $('#modalSuccess').modal();
          } else {
            $('.modal-title').text('Ошибка');
            $('.modal-body').html(data.error);
            $('#modalError').modal();
          }
        }
      });
    });
  }

  function updateCartSum() {
    const deliveryPrice = parseFloat($('.cost-delivery').text());
    const productPrice = parseFloat($('.cost-product').text());
    const totalCost = deliveryPrice + productPrice;

    $('.cost-cart').text(totalCost.toFixed(2));
  }
});
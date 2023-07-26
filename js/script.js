$(document).ready(function() {
  // Заменяем все символы \u2028 на пробелы
  $("body").html($("body").html().replace(/\u2028/g, ' '));

  // Инициализация слайдера
  $('.reviews-slider').slick({
    accessibility: false,
    centerMode: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    variableWidth: true,
    centerPadding: '0',
    responsive: [{
      breakpoint: 1700,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      }
    }, {
      breakpoint: 767,
      settings: {
        slidesToShow: 1,
      }
    }]
  });

  // Добавление класса к соседям активного элемента слайдера
  $(".reviews-slider__photo-wrapper.slick-current").siblings().addClass('sibling');

  // Обработка клика по заголовку аккордеона
  $('.accordion-header').click(function (){
    $(this).toggleClass('in').next().slideToggle();
    $('.accordion-header').not(this).removeClass('in').next().slideUp();
  });

  var $btnTop = $(".back_To_Top");

  // Обработка скролла страницы
  $(window).scroll(function() {
    var headerHeight = $('header').height();
    var episodeHeight = $('.episode').height();
    var scrollTop = $(this).scrollTop();
    
    $('.header').toggleClass("sticky", scrollTop > 0.1);
    $btnTop.fadeToggle(scrollTop > headerHeight + episodeHeight);
  });

  // Перемещение страницы вверх при клике на кнопку
  $btnTop.click(function() {
    $('html, body').animate({ scrollTop: 0 }, 700);
  });

  // Обработка клика по элементу меню
  $('.header-menu').click(function() {
    $(this).toggleClass('act');
    $('.header-nav').toggleClass('act');
  });
});

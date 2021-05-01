$("body").children().each(function() {
  document.body.innerHTML = document.body.innerHTML.replace(/\u2028/g, ' ');
});

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

$( ".reviews-slider__photo-wrapper.slick-current" ).siblings().addClass('sibling');

$(document).ready(function () {
	$('.accordion-header').click(function (){
		$(this).toggleClass('in').next().slideToggle();
		$('.accordion-header').not(this).removeClass('in').next().slideUp();
	})
});

$(window).scroll(function() {
  if ($(this).scrollTop() > 0.1){  
      $('.header').addClass("sticky");
  }
  else{
      $('.header').removeClass("sticky");
  }
});

var $btnTop = $(".back_To_Top")

$(window).on('scroll', function() {
  if ($(this).scrollTop() > $('header').height() + $('.episode').height()) {
   $btnTop.fadeIn(100);
  } else {
   $btnTop.fadeOut(100);
  }
});
 
 /* ARROW SCROLL */
$btnTop.on('click', function() {
  $('html, body').animate({
   scrollTop: 0
  }, 700);
});

$(document).ready(function(){
	// menu click event
	$('.header-menu').click(function() {
		$(this).toggleClass('act');
			if($(this).hasClass('act')) {
				$('.header-nav').addClass('act');
			}
			else {
				$('.header-nav').removeClass('act');
			}
	});
});
$(document).ready(function(){

	var $bg_dark = $('.bg-dark');
	var bg_state = null;
	var scroll_white = 100;
	var scroll_dark = $(document).height();
	console.log(scroll_dark);

	$(window).scroll(function() {
		var scroll_current = $(this).scrollTop();
		if (scroll_current == scroll_white) {
			console.log(1);
			if (bg_state != 'white') {
				bg_state = 'white';
				$bg_dark.stop().animate({
					opacity: 0
				});
			}
		} else if ((scroll_current) < (scroll_dark/2)) {
			console.log(2);
			if (bg_state != 'dark') {
				bg_state = 'dark';
				$bg_dark.stop().animate({
					opacity: 1
				},3000);
			}
		} else if ((scroll_current) > (scroll_dark/2)) {
			console.log(3);
			if (bg_state != 'white') {
				bg_state = 'white';
				$bg_dark.stop().animate({
					opacity: 0
				},3000);
			}
		} else {
			console.log(4);
			bg_state = null;
			$bg_dark.stop().animate({
				opacity: (scroll_current - scroll_white) / (scroll_dark - scroll_white)
			});
		}
	});
});
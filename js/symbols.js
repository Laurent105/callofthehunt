var righters=["symbol2","symbol6","symbol16","symbol21","symbol23"];$(function(){$(".symbol").click(function(){$(this).addClass("anim wow pulse");new WOW().init();$(this).addClass("selected");var classes=$(this).attr("class").split(' ');if($.inArray(classes[1],righters)==-1){$(this).addClass("notright");}
var elems=$(".selected");var elemsTotal=elems.length;var elems_notright=$(".notright");var elemsTotal_notright=elems_notright.length;if(elemsTotal==5){if(elemsTotal_notright==0){$('#boxed-wrapper').addClass('correct');window.location.href="/moose/final";}else{$('#boxed-wrapper').addClass('wrong');setTimeout(function(){$(".symbol").removeClass("anim wow pulse");$(".symbol").removeClass("selected");$(".symbol").removeClass("notright");$('#boxed-wrapper').removeClass('correct');$('#boxed-wrapper').removeClass('wrong');},1000);}}});});

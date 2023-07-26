var righters = ["symbol2", "symbol6", "symbol16", "symbol21", "symbol23"];

$(function() {
  $(".symbol").click(function() {
    var $this = $(this);
    var symbolClass = $this.attr("class").split(' ')[1];

    $this.addClass("anim wow pulse selected")
      .toggleClass("notright", $.inArray(symbolClass, righters) === -1);
      
    new WOW().init();

    var selectedSymbols = $(".selected").length;
    var notRightSymbols = $(".notright").length;

    if (selectedSymbols === 5) {
      if (notRightSymbols === 0) {
        $('body').addClass('correct');
        window.location.href = "./final.html";
      } else {
        $('body').addClass('wrong');
        setTimeout(function() {
          $(".symbol").removeClass("anim wow pulse selected notright");
          $('body').removeClass('correct wrong');
        }, 1000);
      }
    }
  });
});

(function ($) {
  $.fn.formatAuthors = function (max) {
    return this.each(function () {
      var node = $(this),
        authors = node.find(".author");

      if (authors.length > max) {
        authors.slice(max - 1, -1).wrap("<span class='hidden'></span>");
        var et = $("<i>", {
          "class": "et-al",
          "text": " et al."
        }).click(function (event) {
          event.stopPropagation();
          $(this).hide().parent().find(".hidden .author").unwrap();
        }).appendTo(node);
      }

      var comma = document.createTextNode(", ");
      authors.not(":last").after(comma);
    });
  };
})(jQuery);

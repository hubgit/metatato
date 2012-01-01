(function($) {
  $.event.props.push("dataTransfer");

  $.fn.draggable = function(selector){
    var self = this;

    this.dragStart = function(event){
      var img = document.createElement("img");
      img.setAttribute("src", "static/binary/doc.png");
      event.dataTransfer.setDragImage(img, 10, 10);
      
      var item = $(this).data("item");
      event.dataTransfer.setData("text/plain", item.data.id);
    };

    this.dragEnd = function(event){
      $(this).removeClass("dragover");
    };

    return this.each(function(){
      $(this).on({
        "dragstart": self.dragStart,
        "dragend": self.dragEnd,
      }, selector);
    });
  };

  $.fn.droppable = function(selector) {
    var self = this;

    this.dragEnter = function(event){
      event.preventDefault();
      $(this).addClass("dragover");
    };

    this.dragLeave = function(event){
      event.preventDefault();
      $(this).removeClass("dragover");
    };

    this.dragOver = function(event){
      event.preventDefault();
    };

    this.dragDrop = function(event){
      event.preventDefault();
      $(this).removeClass("dragover").trigger("drop.dragdrop", event.dataTransfer.getData("text/plain"));
    };

    return this.each(function() {
      $(this).on({
        "dragenter": self.dragEnter,
        "dragleave": self.dragLeave,
        "dragover": self.dragOver,
        "drop": self.dragDrop,
      }, selector);
    });
  };
  })(jQuery);


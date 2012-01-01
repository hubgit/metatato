Views.FacetsView = function(options) {
  var self = this;
  var container = $(options.container);
  var id = options.id;

  this.render = function(){
    console.log("Rendering " + id);
    container.find("#" + id).remove();
    self.node = $("<div/>", { id: id }).droppable(".filter").appendTo(container);
  };

  return this;
};
Views.FiltersView = function(options) {
  var self = this;
  var container = $(options.container);
  var id = "filters-" + options.field;

  this.render = function(){
    console.log("Rendering " + id);
    container.find("#" + id).remove();

    var template = $("#filters-template").html();
    self.node = $(Mustache.to_html(template, { id: id, title: options.title })).data({ field: options.field });

    var filtersList = self.node.find(".filters-list");

    options.items.map(function(data){
      var template = $("#filter-template").html();
      $(Mustache.to_html(template, data)).data("name", data.name).appendTo(filtersList);
    });

    container.append(self.node);
  };

  return this;
};
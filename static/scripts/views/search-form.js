Views.SearchFormView = function(options){
  var self = this;
  var container = $(options.container);
  var id = "search-form";
  
  this.render = function(){
    console.log("Rendering " + id);
    container.find("#" + id).remove();
    
    var template = $("#search-template").html();
    self.node = $(Mustache.to_html(template, { id: id, q: options.currentQuery })).appendTo(container);
  };
  
  return this;
};
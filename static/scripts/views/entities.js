Views.EntitiesView = function(options){
  var self = this;
  var container = $(options.container);
  var id = "page-text-entities";
  
  this.render = function(){
    console.log("Rendering " + id);
    container.find("#" + id).remove();
        
    var template = $("#entities-template").html();
    self.node = $(Mustache.to_html(template, options.profile)).appendTo(container);
  };
  
  return this;
};
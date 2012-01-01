Views.SyncView = function(options){
  var self = this;
  var container = $(options.container);
  var id = "main-sync";
  
  this.render = function(){
    console.log("Rendering " + id);
    container.find("#" + id).remove();
    
    var template = $("#sync-template").html();
    self.node = $(Mustache.to_html(template, { id: id })).appendTo(container);
  };
  
  return this;
};
Views.PageView = function(options){
  this.render = function(){
    console.log("Rendering " + options.id);
    var template = $("#page-template").html();
    this.node = $(Mustache.to_html(template, { id: options.id })).appendTo(options.container);
  }
};
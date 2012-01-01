Views.TextView = function(options){
  var self = this;
  var container = $(options.container);
  var id = "page-text-text";
  
  this.render = function(){
    console.log("Rendering " + id);
    container.find("#" + id).remove();
        
    var template = $("#text-template").html();
    self.node = $(Mustache.to_html(template, options.profile)).appendTo(container);
    
    var annotators = $("<div/>", { class: "facet-list annotators", id: id });
    
    options.items.map(function(data){
      data.path = "text";
      var template = $("#facet-template").html();
      $(Mustache.to_html(template, data)).data("annotator", data).appendTo(annotators);
    });

    annotators.appendTo(self.node);
  };
  
  return this;
};
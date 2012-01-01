Views.RelatedView = function(options){
  var self = this;
  var container = $(options.container);
  var id = "facet-related-sources";
  
  this.render = function(){
    console.log("Rendering " + id);
    container.find("#" + id).remove();
        
    self.node = $("<div/>", { class: "facet-list facet-related-sources", id: id });
    
    options.items.map(function(data){
      data.path = "related";
      var template = $("#facet-template").html();
      $(Mustache.to_html(template, data)).data("source", data).appendTo(self.node);
    });

    self.node.appendTo(container);
  };
  
  return this;
};
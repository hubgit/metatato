Views.SearchSourcesView = function(options){
  var self = this;
  var container = $(options.container);
  var id = "facets-search-sources";
  
  this.render = function(){
    console.log("Rendering " + id);
    container.find("#" + id).remove();
        
    self.node = $("<div/>", { class: "facet-list facets-search-sources", id: id });
    
    options.items.map(function(data){
      data.path = "search";
      //data.query = "?source=" + encodeURIComponent(data.id);
      var template = $("#facet-template").html();
      $(Mustache.to_html(template, data)).data("source", data.id).appendTo(self.node);
    });

    self.node.appendTo(container);
  };
  
  return this;
};
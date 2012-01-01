Views.SectionView = function(options){
  var self = this;
  var container = $(options.container);
  var id = options.section;
  
  this.render = function(){
    console.log("Rendering " + id);
    
    var selectorContainer = (id == "settings") ? ".sections-settings" : ".section-selectors";
    self.selector = $("<a/>", { class: "section-selector", href: "/" + id, text: id }).attr("data-section", id).appendTo(selectorContainer);    
    self.node = $("<div/>", { class: "section", id: id }).attr("data-section", id).appendTo(container);
  };
  
  return this;
};
var Section = function(){};

Section.prototype.init = function(id, pages){    
  app.sections[id] = this;

  this.id = id;
  this.selector = ".section-selector[data-section=" + id + "]";
  this.firstPage = pages[0];

  this.pages = {};
  for (var i in pages) this.pages[pages[i]] = {};
};

Section.prototype.addPage = function(id){
  var page = new Page({ section: this.id, page: id });
  page.render({ container: this.node });
  this.pages[id] = page;
};

Section.prototype.active = function(){
  console.log("Showing section " + this.id);  
  app.selectedSection = this.id;
  
  // need to unset active selector before using setActiveNode, as there are two sets of selectors
  $(".section-selector").removeClass("active");
  
  // section selector and section node
  $("[data-section=" + this.id + "]").each(function(i, node){ setActiveNode(node); });
};

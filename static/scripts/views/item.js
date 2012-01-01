Views.ItemView = function(options) {
  var self = this;
  var container = $(options.container);
            
  this.render = function(){
    var data = options.item.data;
    
    var template = $("#item-header-template").html();
    self.node = $(Mustache.to_html(template, data));
    self.node.find(".authors").formatAuthors(100);
    container.find("[data-role=header]").empty().append(self.node);
    //if (options.item.data.pmid || options.item.data.doi) gapi.plusone.go();
    
    if (options.item.data.fileCount) container.addClass("has-files");
    
    var node = $("<iframe/>", { name: "read", "data-role": "content", src: "about:blank" }); // javascript:false ?
    container.find("[data-role=content]").replaceWith(node);
    
    options.item.showFile();
  };
  
  return this;
};


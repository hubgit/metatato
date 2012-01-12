Views.ItemView = function(options) {
  var self = this;
  var container = $(options.container);
            
  this.render = function(){
    options.item.prepare();
    var data = options.item.data;
    if (typeof data.fileCount == "undefined") data.fileCount = options.item.fileCount;

    // header (metadata)
    var template = $("#item-header-template").html();
    self.node = $(Mustache.to_html(template, data));
    self.node.find(".authors").formatAuthors(100);
    container.find("[data-role=header]").empty().append(self.node);
    
    // body (pdf viewer)
    var node = $("<iframe/>", { name: "read", "data-role": "content", src: "about:blank", mozallowfullscreen: true }); // javascript:false ?
    container.find("[data-role=content]").replaceWith(node);
    
    if (options.item.fileCount()) {
      container.addClass("has-files");
      options.item.showFile(container, self.render);
    }
    //if (options.item.data.pmid || options.item.data.doi) gapi.plusone.go();
    
  };
  
  return this;
};


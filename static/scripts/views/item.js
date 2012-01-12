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
    
    container.find("iframe[data-role=content]").replaceWith("<div data-role='content'></div>");
    var contentNode = container.find("[data-role=content]");
    contentNode.find(".pdf-message").remove();
    
    // body (pdf viewer/download link)
    if (options.item.fileCount()) {
      container.addClass("has-files");   

      if (detectPDFPlugin()) {
        $("<div/>", { class: "pdf-message has-pdf-plugin" }).appendTo(contentNode);
      }
      else {
        $("<div/>", { class: "pdf-message", text: "A PDF plugin is needed for viewing this content inline." }).appendTo(contentNode);
      }
      
      options.item.showFile(container, self.render);
    }
    else {
      container.removeClass("has-files");
    }
    
    //if (options.item.data.pmid || options.item.data.doi) gapi.plusone.go();
    
  };
  
  return this;
};


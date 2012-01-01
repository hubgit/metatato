Views.ItemsView = function(options) {
  var self = this;
  var container = $(options.container).find("[data-role=content]");
  var start;
  var id = options.id;
   
  this.render = function(){
    container
      .find("#" + id).remove()
      .find(".more").remove()
      .scrollTop(0)
      .unbind("scroll.wl");
      
    self.node = $("<div/>", { id: id, class: "collection" }).appendTo(container);      
        
    start = 0;
    self.displayItems(start);
    
    if (options.collection.length > options.itemsPerPage) self.infiniteScroll();
  };
  
  this.displayItems = function(start){
    options.collection.slice(start, start + options.itemsPerPage).map(function(data) {
      var item = new Item(data);
      item.prepare();
      
      var itemURL = $.extend(true, {}, options.itemURL, { query: { item: data.id }}); 
      item.data.localURL = buildUrl(itemURL);
      if (!item.data.source) item.data.source = "catalog";
      
      var template = $("#item-view-template").html();
      var node = $(Mustache.to_html(template, item.data)).data("item", item);
      node.find(".authors").formatAuthors(3);
      if (data.id == app.selectedItem) node.addClass("active");
      self.node.append(node);
    });
  };
  
  this.infiniteScroll = function(){
    var moreNode = $("<div/>", { class: "more" });
    
    container.find(".more").remove().end().append(moreNode).bind("scroll.wl", function showMoreItems(){ 
       if (container.scrollTop() >= self.node.height() - container.height() - 10) {
          start += options.itemsPerPage;        
          if (start > options.collection.length) {
            container.unbind("scroll.wl");
            return;
          }
          self.displayItems(start);
       }
    });
  };
  
  return this;
};

Views.ItemsHeaderView = function(options) {
  var self = this;
  var container = $(options.container).find("[data-role=header]");
  var id = options.id;
  
  this.render = function(){
    container.find("#" + id).remove();
    self.node = $("<div/>", { id: id, class: "collection-header" }).appendTo(container);      
    
    var template = $("#items-header-template").html();
    var node = $(Mustache.to_html(template, {}));
    self.node.append(node);
  }
};
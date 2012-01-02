var SectionLibraryController = function(){
  var self = this;
  this.init("library", ["filters", "items", "item"]);
  this.selectedFilters = [];
  this.libraryUpdated = true;
  this.updatingLibraryViews = false;
  this.lastUpdated = 0;
  this.updatingInterval = null;
    
  this.pagesRendered = function(){
    //syncController.renderSyncView();
    //app.objectStore.count(self.countedItems);
    self.handleLibraryUpdates();    
    self.renderLibrary();
  };
  
  this.handleLibraryUpdates = function(){
    self.updatingInterval = window.setInterval(self.renderLibrary, 5000);
        
    $(document).on("library-updated", self.node, function(event){
      self.libraryUpdated = true;
      self.renderLibrary();
    });
  }
  
  this.renderLibrary = function(){
    if (self.updatingLibraryViews || !self.libraryUpdated) return;
    
    var now = new Date(Date.UTC);
    if (now - self.lastUpdated < 5000) return;
    
    window.clearInterval(self.updatingInterval);
    
    self.updatingLibraryViews = true;
    self.libraryUpdated = false;
    self.lastUpdated = now;
    
    app.objectStore.count(self.countedItems);
    
    self.updatingInterval = window.setInterval(self.renderLibrary, 5000);
  };
  
  this.handleURL = function(parts, query, hash){
    console.log(["handleURL", parts, query, hash]);
    self.filters = [];
    if (query.filters) {
      query.filters.split(",").forEach(function(filter){
        var filterParts = filter.split(":");
        self.filters.push({ field: decodeURIComponent(filterParts[0]), value: decodeURIComponent(filterParts[1]) });
      });
    }
    else {
      //cleanNode(self.pages.items);
    }
    
    self.selectedFilters = self.filters;
    
    if (query.item) {
      app.selectedItem = query.item;
      setActiveNode("#item-" + app.selectedItem, self.pages.items);
      self.loadItem(query.item);
    }
    else {
      cleanNode(self.pages.item);
    }
    
    if (!self.compareFilters(self.selectedFilters, self.filters)) app.objectStore.count(self.countedItems);
  };
  
  this.countedItems = function(total){
    console.log("Counted " + total + " items");
    
    setMessage(self.pages.filters, null);
    
    self.renderSmartFilters(total);
    
    var view = new Views.FacetsView({ container: self.pages.filters.contentNode, id: "library-facets" });
    view.render();
    
    facetsController.loadFilteredItems(self.filters);
    //else $("#all-items").click(); // selected page?
    
    //syncController.syncItems();
  };
  
  this.loadItem = function(id){
    app.objectStore.get(id, itemController.render);
  };
  
  this.loadItems = function(){
    app.objectStore.select({ sort: "added", order: "desc" }, self.showItems);        
  }
  
  this.showItems = function(items){
    console.log("Showing " + items.length + " items");
    app.collection = items;
    facetsController.render(self.filters);
    self.updatingLibraryViews = false;
    $(self.node).trigger("collection-ready");
   };
  
  this.renderSmartFilters = function(total){
    var allItemsFilter = {
      "id": "all-items",
      "name": "All Items",
      "count": total,
    };    
  
    var view = new Views.FiltersView({ container: self.pages.filters.contentNode, field: "smart", items: [allItemsFilter] });
    view.render();
    view.node.on("click", ".filter", self.smartFilterSelected);
  };
  
  this.smartFilterSelected = function(event){
    var node = $(this);
    setActiveNode(node);
    self.loadItems(node.data("filter") || {}); 
  };
  
  this.compareFilters = function(a, b) {
    if (a.length == b.length) return true;

    return false; // TODO

    return true;
  }
};

SectionLibraryController.prototype = new Section;
new SectionLibraryController;

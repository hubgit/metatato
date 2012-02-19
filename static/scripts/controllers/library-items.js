var PageLibraryItemsController = function(){
  var self = this;
  this.node = "#library-items";

  this.bind = function(){
    $(document)
      .on("collection-ready", app.sections.library.node, self.renderCollectionView)
      //.on("click", ".fullscreen", self.readFullScreen)
      //.on("click", ".speak", self.speakAbstract)
      .on("click", "#library-items .item", self.itemSelected)
  };
  
  this.renderCollection = function(collection, itemUrlTemplate){
    console.log("Rendering a collection of " + collection.length + " items");
    var itemURL = { path: "/library", hash: "library-item" };
    var view = new Views.ItemsView({ 
      container: self.node, 
      collection: collection, 
      id: "library-collection", 
      itemURL: itemURL, 
      start: 0, 
      itemsPerPage: 50,
    });
    view.render();
    view.node.parent().scrollTop(0);
    $(self.node).draggable(".item");
  };

  this.renderCollectionView = function(event){
    self.renderCollection(app.collection);
    self.renderCollectionHeaderView();
  };
  
  this.renderCollectionHeaderView = function(){
    var view = new Views.ItemsHeaderView({ container: self.node, id: "library-collection-header" });
    view.render();
    
    view.node.find("form").on("submit", false);
    view.node.find("input").on("input", self.filterCollection);
  };
  
  this.filterCollection = function(event){    
    var q = $(this).val();
    var collection = q ? self.filterCollectionByTitle(app.collection, q) : app.collection;
    self.renderCollection(collection);
  };
  
  this.filterCollectionByTitle = function(collection, q){
    var re = new RegExp(q, "i");
    collection = collection.filter(function(item){
      return item.title.search(re) !== -1;
    });
    return collection;
  };

  this.itemSelected = function(event){
    event.preventDefault();
    var target = $(event.target);
    
    // a click on the "Edit" button
    if (target.closest("#item-edit").length) {
      event.preventDefault();
      return false;
    }
    
    if (target.attr("href")) return; // handled by router
    
    // remove the editing panel if it's open anywhere
    $("#item-edit").remove();
        
    // handle clicks on buttons
    if (target.parent().hasClass("links")) return self.handleButtonAction(target.data("action"), this);
    
    var href = target.closest(".item").find(".title a").attr("href");
    app.router.setURL(href);
  };
  
  this.handleButtonAction = function(action, node){
    switch (action){
      // show the item editing pane
      case "edit":
        node.scrollIntoView(true);
        var view = new Views.ItemEditView({ container: node });
        view.render();
        
        view.node.find("select[name=type]").change(function typeChanged(event){  
          app.item.data.type = $(this).val();
          view.render();
          view.node.show();
        });
      break;
    }
  };
}

var itemsController = new PageLibraryItemsController;
itemsController.bind();

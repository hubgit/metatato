var SectionGroupsController = function(){
  var self = this;
  this.init("groups", ["groups", "items", "item"]);
  
  this.pagesRendered = function(){
    $(self.pages.groups.node).on("click", ".facet", self.groupSelected)
    $(self.pages.items.node).on("click", ".item", self.itemSelected)
    
    setMessage(self.pages.groups, "Loading groups&hellip;");
    $.getJSON("api/groups", self.renderGroupsPage);
  };

  this.renderGroupsPage = function(data){
    if (data) self.groups = data;
    
    self.groups.forEach(function setSelectedGroup(group){
      group.selected = (group.id == self.selectedGroup);
    });
    
    self.pages.groups.contentNode.empty();
        
    var view = new Views.GroupsView({ container: self.pages.groups.contentNode, items: self.groups });
    view.render();
    
    // TODO: group search not available in the API
    //var view = new Views.GroupsHeaderView({ container: self.pages.groups.headerNode });
    //view.render();
  };
  
  this.handleURL = function(parts, query, hash){
    console.log(["group handleURL", parts, query, hash]);
        
    if (query.group) {
      if (query.group != self.selectedGroup) self.loadGroupItems(query.group);
      self.selectedGroup = query.group;
      setActiveNode("#group-facet-" + query.group);
    }
    else {
      cleanNode(self.pages.items);
      self.selectedGroup = null;
      $(".active", self.pages.groups).removeClass("active");
    }
            
    if (query.group && query.item) {
      self.selectedItem = query.item;
      self.loadItem(query.group, query.item);
    }
    else {
      cleanNode(self.pages.item);
    }
  };

  this.groupSelected = function(event){
    event.preventDefault();
    
    var node = $(this);    
    var group = node.data("group");
    app.selectedGroup = group;
        
    app.router.setURL("/groups", { group: group.id }, "groups-items");
  };
  
  this.loadGroupItems = function(groupId){  
    setMessage(self.pages.items, "Loading items&hellip;");
    
    $.getJSON("api/documents", { group: groupId }, function showGroupItems(data){
      if (!data.document_ids.length) return;
            
      var count = 0;
      var total = data.document_ids.length; // TODO: pagination
      var collection = [];
            
      data.document_ids.forEach(function fetchGroupItems(docId){
        $.getJSON("api/documents/" + encodeURIComponent(docId), { group: groupId }, function showGroupItem(item){
          if (!item) return;
          collection.push(item);
          if (++count == total){
            setMessage(self.pages.items, null);
            var view = new Views.ItemsView({ container: self.pages.items.view.node, collection: collection, id: "groups-collection", itemsPerPage: parseInt(data.items_per_page) });
            view.render();
            setActiveNode(self.pages.items.view.node);
          }
        });
      });
    });
  };
  
  this.itemSelected = function(event){
    event.preventDefault();

    var node = $(this);
    var item = node.data("item");
    
    app.router.setURL("/groups", { group: self.selectedGroup, item: item.data.id }, "groups-item");
  };
  
  this.loadItem = function(groupId, docId){
    setMessage(self.pages.item, "Loading item&hellip;");
    
    $.getJSON("api/documents/" + encodeURIComponent(docId), { group: groupId }, function showGroupItem(data){
      var item = new Item(data);
      item.groupId = groupId;
      var view = new Views.ItemView({ container: self.pages.item.view.node, item: item });
      view.render();
      
      setActiveNode("#groups-collection #item-" + docId);
    
      /*
      var identifiers = item.data.identifiers;
      if (identifiers.doi){
        self.fetchAnnotationsByDOI(identifiers.doi);
      }
      else if (identifiers.pmid){
        self.fetchAnnotationsByPMID(identifiers.pmid);
      }
      else {
        self.pages.item.contentNode.text("This item has no useful identifiers");
      }
      */
    });
  };
  
  /*
  this.fetchAnnotationsByPMID = function(pmid){
    return [];
    $.getJSON("annotate", { annotator: "whatizit", pmid: pmid }, function(data){
      
    });
  };
  
  this.fetchAnnotationsByDOI = function(doi){
    var annotations = [
      {
        type: "gene",
        title: "CD25",
      }
    ];
    console.log(annotations);
  };
  */
};

SectionGroupsController.prototype = new Section;
new SectionGroupsController;

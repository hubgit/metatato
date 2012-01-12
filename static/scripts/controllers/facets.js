var FacetsController = function(){
  var self = this;
  this.node = "#library-facets";
  
  this.facets = [
    { field: "tags", title: "Tags", sort: "count" },
    { field: "publication_outlet", title: "Publication", sort: "count" },
    { field: "fileCount", title: "Files", sort: "desc-int" },
    { field: "oa_journal", title: "Open Access", sort: "asc" },
    { field: "year", title: "Year", sort: "desc-int" },
  ];
  
  this.bind = function(){
    $(document).on("click", this.node + " .filter", self.facetSelected)
  };
  
  this.render = function(active){
    console.log("Rendering facets");
    
    var container = $(self.node);
    container.find(".filters:not(#filters-smart)").remove();
    
    var options = { items: app.collection, container: container };
    self.facets.forEach(function(facet){
      self.addFacet(options, facet);
    });
    
    if (active && active.length){
      active.forEach(function(activeFilter){
        container.find("#filters-" + activeFilter.field + " .filter").filter(function(){
          return $(this).data("name") == activeFilter.value;
        }).addClass("active");
      });
    }
    
    //setActiveLinks(container);
  };
  
  this.addFacet = function(options, facet){    
    var counts = app.objectStore.facet(options.items, facet.field);
    var container = $(options.container);
    
    var filters = $.map(counts, function(count, value){
      return { name: value, count: count, field: facet.field };
    });
    
    if (!filters.length) return;
    
    switch (facet.sort){
      case "count":
      default:
        filters.sort(function(a, b){ 
          return b.count - a.count; 
        });
      break;
      
      case "asc-int":
        filters.sort(function(a, b){
          return a.name - b.name; 
        });
      break;
      
      case "desc-int":
        filters.sort(function(a, b){           
          return b.name - a.name; 
        });
      break;
      
      case "asc":
        filters.sort(function(a, b){
          return a.name.toLowerCase() > b.name.toLowerCase(); 
        });
      break;
      
      case "desc":
        filters.sort(function(a, b){           
          return b.name.toLowerCase() > a.name.toLowerCase(); 
        });
      break;
    }
        
    var view = new Views.FiltersView({ container: container, items: filters, field: facet.field, title: facet.title });
    view.render();
    
    view.node.find(".filter").bind("drop.dragdrop", self.drop);
  }
    
  this.facetSelected = function(event){
    console.log("Facet selected");
    event.preventDefault();
    
    //$("#filters-smart .filter").removeClass("active");
    
    var node = $(this);        
    //if (!event.metaKey) node.siblings(".active").removeClass("active");
    //if (node.hasClass("active")) return false;
    //node.toggleClass("active", !$(event.target).hasClass("remove"));
    node.toggleClass("active");
    var filters = [];
    
    $(self.node + " .filter.active").each(function(){
      var filter = $(this);
      filters.push({
        field: filter.closest(".filters").data("field"),
        value: filter.data("name"),
      });
    });
    
    app.router.setURL("/library", { filters: self.buildFiltersString(filters) }, "library-items");
    
    return self.loadFilteredItems(filters);
  };
  
  this.buildFiltersString = function(items){
    var output = [];
    items.forEach(function(filter){
      output.push(encodeURIComponent(filter.field) + ":" + encodeURIComponent(filter.value));
    });
    return output.join(",");
  };
  
  this.loadFilteredItems = function(filters){ 
    if (!filters || !filters.length){
      setActiveNode("#all-items");
      app.sections.library.loadItems();
      //$("#all-items").click();
      return;
    }
    
    var activeFilters = [];
    filters.forEach(function(filter){
      activeFilters.push({
        field: filter.field,
        value: filter.value,
        sort: "year",
        order: "desc",
      });
    });
    
    var totalActiveFilters = activeFilters.length;
    console.log(totalActiveFilters + " active filters");
    
    var filtersDone = 0;
    var ids = {};
    var selectedItems = {};
    var finalItems = [];
    activeFilters.forEach(function(filter){
      app.objectStore.select(filter, function(items){
        items.forEach(function(item){
          if (typeof ids[item.id] == "undefined") ids[item.id] = 0;
          ids[item.id]++;
          selectedItems[item.id] = item;
        });
        if (++filtersDone == totalActiveFilters) {
          $.each(ids, function(id, count){
            if (count < totalActiveFilters) return true; // continue -- needs to show up in all facets
            finalItems.push(selectedItems[id]);
          });
                    
          app.sections.library.showItems(finalItems);
          self.render(activeFilters);
          //setActiveNode(app.sections.library.pages.items.view.node);
        }
      });
    });
  };
  
  this.drop = function(event, id){
    if (!id) return;
    var node = $(this);

    var field = node.closest(".filters").data("field");
    if (!field) return;

    var value = node.data("name");
    if (!value) return;

    app.objectStore.get(id, function(item){
      if ($.inArray(value, item[field]) != -1) return;
      
      item[field].push(value);

      app.objectStore.put(item, function(){
        var count = node.find(".count");
        count.text(parseInt(count.text()) + 1);
      });

      // TODO: enable tag saving when item editing is supported
      /*.ajax({
        type: "POST",
        url: "documents/" + encodeURIComponent(id),
        data: data,
        dataType: "json",
        success: function(data, textstatus, jqXHR){
          node.removeClass("dragover");
          var count = node.find(".count");
          count.text(parseInt(count.text()) + 1);
        },
        });*/
      });
    };
};

var facetsController = new FacetsController;
facetsController.bind();

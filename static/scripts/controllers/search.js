var SectionSearchController = function(){
  var self = this;
  this.init("search", ["sources", "items", "item"]);
  
  var eutils = new EUtils("test", "alf@hubmed.org");
  
  this.pagesRendered = function(){
    $(document)
      .on("click", "#search-items .item", self.itemSelected)
      .on("click", ".search-source", self.searchSourceSelected)
      
    //self.renderSearchInput();
  };
  
  this.handleURL = function(parts, query, hash){    
    console.log(["handleurl search", parts, query, hash]);
    var original = {
      query: self.currentQuery,
      source: self.currentSource,
      item: self.currentItem,
    };
    
    if (query.q) {
      self.currentQuery = query.q;
    }
    else {
      // reset query ? 
      self.currentQuery = null;
    }
      
    if (query.source) {
      self.currentSource = query.source;
    }
    else {
      self.currentSource = null;
      // reset filters ? 
    }
    
    if (query.item) {
      self.currentItem = query.item;
    }
    else {
      self.currentItem = null;
      var page = app.sections.search.pages.item;
      page.headerNode.empty();
      page.contentNode.empty();
    }
    
    if (!self.currentQuery || self.currentQuery != original.query){
      self.renderSearchInput();
      if (self.currentQuery) self.runSearches(self.currentQuery);
    }
    
    if (self.currentSource != original.source){
      self.runSearch(self.currentSource, self.currentQuery);
    }
    
    if (self.currentSource && self.currentItem){
      self.renderMainItem({ data: { id: self.currentItem } }, self.currentSource);
    }
    
    console.log([self.currentQuery, self.currentSource, self.currentItem]);
  };
  
  this.renderSearchInput = function(){
    var view = new Views.SearchFormView({ container: self.pages.sources.headerNode, currentQuery: self.currentQuery });
    view.render();

    self.searchSources = [
      { title: "Mendeley Catalog", id: "catalog", class: "search-source" },
      { title: "PubMed", id: "pubmed", class: "search-source" },
    ];
    
    var sourcesView = new Views.SearchSourcesView({ container: self.pages.sources.contentNode, items: self.searchSources });
    sourcesView.render();
    
    sourcesView.node.find(".search-source").hide();
    
    var form = view.node;
    form.on("submit", function(event){
      event.preventDefault();
      setMessage(self.pages.items, "Searching&hellip;");
      sourcesView.node.find(".search-source").hide();
      
      var form = $(this);
      var q = form.find("input[name=q]").val();
            
      app.router.setURL("/search", { q: q });
    });
  };
  
  this.runSearches = function(q){
    console.log("Searching for " + q);
    self.pages.sources.contentNode.find(".search-source").each(function(){
      var node = $(this);
      node.data("q", q);
      node.attr("href", node.attr("href") + "?q=" + encodeURIComponent(q));

      var source = node.data("source");
      self.runSearch(source, q);
    });
  };
  
  this.runSearch = function(source, q){
    if (!source || !q) return; // TODO: clear results
    console.log("Searching " + source + " for " + q);
    
    setMessage(self.pages.items, "Searching&hellip;");
    
    switch (source){
      case "catalog":
        $.getJSON("api/catalog", { q: q }, function(data){
          self.setSearchResults("catalog", data.total_results, q, function(){
            var items = data.documents.map(function(item){
              item.id = item.uuid;
              item.source = "catalog";
              item.selected = (self.currentItem == item.id);
              return item;
            });
            self.renderSearchResults(items, source);
          });
        });
      break;
      
      case "pubmed":
        //var eutils = new EUtils("test", "alf@hubmed.org");
        eutils.search(q, function handleSearchResponse(xml, status, xhr){
          var results = eutils.parseSearch(xml);          
          var items = [];
          
          self.setSearchResults(source, parseInt(results.count), q, function(){
            if (items.length) return self.renderSearchResults(items, source);
            eutils.summary(results, function(xml, status, xhr){
              items = eutils.parseSummary(xml);
              items.forEach(function(item){
                item.source = "pubmed";
                item.selected = (self.currentItem == item.id);
              });
              self.renderSearchResults(items, source);
            }, { retstart: results.retstart, retmax: 20 });
          });
        }, 
        { retstart: 1 });
      break;
    } 
  };

  this.setSearchResults = function(source, total, q, items){
    var sources = self.pages.sources.view.node.find(".search-source:hidden");
    console.log(total + " search results");
    
    sources.filter(function(){
      var node = $(this);
      var nodeSource = node.data("source");
      console.log([nodeSource, source]);
      if (nodeSource == source) {
        node.find(".count").text(total);
        node.data("items", items);
        node.attr("href", node.attr("href") + "&source=" + encodeURIComponent(source));
        node.show();
        if (self.currentSource && self.currentSource == source){
          setActiveNode(node);
          if (typeof items == "function") {
            setMessage(self.pages.items, "Fetching items&hellip;");
            items();
          }
        }
      }
    });
    
    if (sources.length === 1&& !self.currentSource) setMessage(self.pages.items, "Choose a search source");
  };
  
  this.searchSourceSelected = function(event){
    var node = $(this);
    setActiveNode(node);
    
    var items = node.data("items");    
    if (typeof items == "function") {
      event.preventDefault();
      setMessage(self.pages.items, "Fetching items&hellip;");
      items();
    }
  };
  
  this.renderSearchResults = function(items, source){
    //var count = 0;
    //var total = items.length;
    setMessage(self.pages.items, null);
    
    //data.documents.forEach(function(item, key){
      //app.objectStore.findOne("canonical_id", item.uuid, function(foundItem){ // FIXME: not finding items
        //item.inLibrary = !!foundItem;
        //if (++count == total) {
          var view = new Views.ItemsView({ container: "#search-items", collection: items, id: "search-collection", itemsPerPage: 20 });
          view.render();
          setActiveNode(self.pages.items.view.node);
          
          /*if (self.currentItem) {
            self.pages.items.view.node.find("#item-" + self.currentItem).click();
          }*/
        //}
      //});
    //});
  };
  
  this.itemSelected = function(event){
    event.preventDefault();
    
    var item = $(this).data("item");
    self.currentItem = item.data.id;

    var target = $(event.target);
    
    if (target.parent().hasClass("links")){
      switch (target.data("action")){
        case "add":
          if (target.hasClass("added")){
            app.router.setURL("/library", { item: item.data.id }, "library-item");
          }
          else {
            self.addItem(item, target);
          }
          return;
      
        default:
          //setActiveNode(self.pages.item.view.node);
          return;
      }
    }
    
    var href = target.attr("href");
    if (href) return; // handled by router
    
    var href = target.closest(".item").find(".title a").attr("href");
    app.router.setURL(href.replace(/#.*/, "") + "#search-item");
    /*   
    var node = $(this);
    setActiveNode(node);
    
    var item = node.data("item");
    self.renderg(item, node.data("source"));
    */
  };
  
  this.renderMainItem = function(item, source){    
    setMessage(self.pages.item, "Fetching item&hellip;");
    
    var itemId = item.data.uuid ? item.data.uuid : item.data.id;
    setActiveNode("#item-" + itemId);
    
    // render the current item, temporarily
    if (item instanceof Item){
      var view = new Views.ItemView({ container: self.pages.item.view.node, item: item });
      view.render();
      setActiveNode(view.node);
    }
    
    switch (source){
      case "catalog":
      default:
      console.log("Rendering catalog item");
        $.getJSON("api/catalog/" + encodeURIComponent(itemId), function(canonicalData){
          canonicalData.published_in = canonicalData.publication_outlet;
          var item = new Item(canonicalData);
          item.data.authorsCount = item.authorsCount;
          if (item.data.identifiers){
            $.each(item.data.identifiers, function setIdentifierField(field, value){
              item.data[field] = value;
            });
          }
      
          var view = new Views.ItemView({ container: self.pages.item.view.node, item: item });
          view.render();
          setActiveNode(view.node);
      
          itemController.fetchMetrics(item, $("#search-item .metrics"));
        });
      break;
      
      case "pubmed":
        console.log("Rendering PubMed item");
        eutils.summaryFromIds([itemId], function(xml, status, xhr){
          var results = eutils.parseSummary(xml);
          var item = new Item(results[0]);
          item.data.authorsCount = item.authorsCount;

          var view = new Views.ItemView({ container: self.pages.item.view.node, item: item });
          view.render();
          setActiveNode(view.node);
        }, 
        { retstart: 1, retmax: 1 });
      break;
    }
  };
  
  this.addItem = function(item, button){
    button.text("Adding").addClass("loading").closest(".item").addClass("loading");
    
    switch(item.data.source){
      case "catalog":
      default:
        $.getJSON("api/catalog/" + encodeURIComponent(item.data.uuid), function(canonicalData){
          var doc = self.convertCatalogDocToInputDoc(canonicalData);
          if (doc.authors.length){
            doc.authors.forEach(function(author, key){
              var name = author.surname;
              if (author.forename) name = author.forename + " " + name;
              doc.authors[key] = name;
            });
            doc.authors = doc.authors.join("\n");
          }
          console.log(doc);
          self.saveItem(self.convertCatalogDocToInputDoc(doc), button);
        });
      break;
      
      case "pubmed":
        eutils.summaryFromIds([item.data.id], function(xml, status, xhr){
          var results = eutils.parseSummary(xml);
          var doc = self.convertCatalogDocToInputDoc(results[0]);
          if (doc.authors.length){
            doc.authors.forEach(function(author, key){
              doc.authors[key] = author.fullname;
            });
            doc.authors = doc.authors.join("\n");
          }
          console.log(doc);
          self.saveItem(doc, button);
        }, 
        { retstart: 1, retmax: 1 });
      break;
    }
  };
  
  this.saveItem = function(doc, button){
    $.post("api/documents", doc, function(data){
      if (!data || !data.document_id) {
        button.removeClass("loading");
        return;
      }
      
      $.getJSON("api/documents/" + data.document_id, function(data){
        button.removeClass("loading");
        if (!data || !data.id) return;
        
        if (!data.canonical_id) {
          app.objectStore.put(data, function(event){
            var item = new Item(data);
            button.text("Added").addClass("added");
            button.closest(".item").addClass("in-library").data("item", item);
          });
          return;
        }

        data.canonical = canonicalData;
        data.oa_journal = canonicalData.oa_journal;

        app.objectStore.put(data, function(event){
          button.text("Added").closest(".item").addClass("in-library");
          //syncController.syncItems();
          //TODO: refresh library view
        });
      });
    }, "json");
  }
  
  this.convertCatalogDocToInputDoc = function(data){
    var doc = {};
    ["abstract", "authors", "issue", "pages", "title", "type", "volume", "website", "year"].forEach(function(field){
      if (typeof data[field] != "undefined" && data[field].length) doc[field] = data[field];
    });
    if (data.published_in) doc.published_in = data.published_in;
    else if (data.publication_outlet) doc.published_in = data.publication_outlet;
    console.log([data, doc]);
    return doc;
  };
}

SectionSearchController.prototype = new Section;
new SectionSearchController;
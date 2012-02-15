var Plugin = function(){
  var self = this;
  
  var eutils = new EUtils(config.eutils.name, config.eutils.email);

  this.init = function(){
    window.addEventListener("message", self.receiveMessage, false);
    $(document).on("click", "#related-collection .item", self.itemSelected);
  };

  this.receiveMessage = function(event){
    //if (event.origin !== "http://metatato.com") return false;

    var data = JSON.parse(event.data);
    var url = data[0].split("/");

    switch (url[0]){
      case "item":
        var item = data[1];
        if (item.pmid) return self.sendResponse(item, [self.buildButton(item.pmid)]);
        //self.relatedArticles(data[1], self.sendResponse);
      break;
    }
  };

  this.sendResponse = function(item, items){
    var data = JSON.stringify(["item/" + item.id, items]);
    window.parent.postMessage(data, "*"); // TODO: actual parent domain
  };
  
  this.saveItem = function(item){
    var data = JSON.stringify(["items", item]);
    window.parent.postMessage(data, "*"); // TODO: actual parent domain
  };
  
  this.buildButton = function(pmid){
    return {
      "url": window.location + "?pmid=" + encodeURIComponent(pmid),
      "text": "Related",
      "domain": "ncbi.nlm.nih.gov",
      "rel": "modal",
    };
  };
  
  this.relatedArticles = function(item, callback){
    if (!item.pmid) return;
    
    eutils.link(item.pmid, function handleSearchResponse(xml, status, xhr){
      var links = eutils.parseRelatedArticles(xml);
      
      var items = [];
      if (links["pubmed_pubmed"]) {
        items.push(self.buildButton(item.pmid));
      }
      
      if (typeof callback == "function") callback(item, items, links);
    }, { "dbfrom": "pubmed", "usehistory": "n"});
  };
  
  this.renderResults = function(item, items, links){
    if (!items.length) return;
    console.log(links); 
    
    var itemsPerPage = 20;

    eutils.summaryFromIds(links["pubmed_pubmed"].slice(0, itemsPerPage), function handleSearchResponse(xml, status, xhr){
      var items = eutils.parseSummary(xml);
      var view = new Views.ItemsView({ container: "#related-items", collection: items, id: "related-collection", itemsPerPage: itemsPerPage });
      view.render();
    }, { "retmax": itemsPerPage });
  };
  
  this.itemSelected = function(event){    
    var button = $(event.target);    
    var item = $(this).data("item");
    
    if (button.parent().hasClass("links")){
      switch (button.data("action")){
        case "add":
          if (button.hasClass("added")) return;
          
          button.text("Adding").addClass("loading").closest(".item").addClass("loading");

          eutils.summaryFromIds([item.data.id], function(xml, status, xhr){
            var results = eutils.parseSummary(xml);
            var doc = convertCatalogDocToInputDoc(results[0]);
            if (doc.authors.length){
              doc.authors.forEach(function(author, key){
                doc.authors[key] = author.fullname;
              });
              doc.authors = doc.authors.join("\n");
            }
            //self.saveItem(doc);
            window.parent.saveItem(doc, button);
          }, 
          { retstart: 1, retmax: 1 });
        break;

        default:
          //setActiveNode(self.pages.item.view.node);
        break;
      }
    }
  };
}

var plugin = new Plugin;
plugin.init();
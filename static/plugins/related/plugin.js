var Plugin = function(){
  var self = this;

  this.init = function(){
    window.addEventListener("message", self.receiveMessage, false);
    self.app = window.parent.app;
  };

  this.receiveMessage = function(event){
    //if (event.origin !== "http://metatato.com") return false;

    var data = JSON.parse(event.data);
    var url = data[0].split("/");

    switch (url[0]){
      case "item":
        var item = data[1];
        self.relatedArticles(item, self.sendResponse);
      break;
    }
  };

  this.sendResponse = function(item, items){
    var data = JSON.stringify(["item/" + item.id, items]);
    console.log(data);
    window.parent.postMessage(data, "*"); // TODO: actual parent domain
  };
  
  this.relatedArticles = function(item, callback){
    if (!item.pmid) return;
    
    var eutils = new EUtils(config.eutils.name, config.eutils.email);
    eutils.link(item.pmid, function handleSearchResponse(xml, status, xhr){
      var links = eutils.parseRelatedArticles(xml);
      var items = [];
      if (links["pubmed_pubmed"]) {
        items.push({
          "url": window.location + "?pmid=" + encodeURIComponent(item.pmid),
          "text": "Related",
          "domain": "ncbi.nlm.nih.gov",
        });
      }
      
      if (typeof callback == "function") callback(item, items, links);
    }, { "dbfrom": "pubmed", "usehistory": "n"});
  };
  
  this.renderResults = function(item, items, links){
    if (!items.length) return;
    console.log(links); 
    
    var itemsPerPage = 20;

    var eutils = new EUtils(config.eutils.name, config.eutils.email);
    eutils.summaryFromIds(links["pubmed_pubmed"], function handleSearchResponse(xml, status, xhr){
      var items = eutils.parseSummary(xml);
      var view = new Views.ItemsView({ container: "#related-items", collection: items, id: "related-collection", itemsPerPage: itemsPerPage });
      view.render();
    }, { "retmax": itemsPerPage });
  };
}

var plugin = new Plugin;
plugin.init();
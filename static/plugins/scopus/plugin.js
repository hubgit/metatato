var Plugin = function(){
  var self = this;

  this.init = function(){
    window.addEventListener("message", self.receiveMessage, false);
    self.app = window.parent.app;
  };

  this.receiveMessage = function(event){
    //if (event.origin !== "http://metatato.com") return false;

    var data = event.data;    
    var url = data[0].split("/");

    switch (url[0]){
      case "item":
        self.fetchMetrics(data[1], self.sendResponse);
      break;
    }
  };

  this.sendResponse = function(item, items){
    var data = ["item/" + item.id, items];
    window.parent.postMessage(data, "*"); // TODO: actual parent domain
  };
  
  this.fetchMetrics = function(item, callback){
    if (!item.doi) return;
  
    var params = { "devId": config.scopus, "search": "DOI(" + item.doi + ")" };
    $.getJSON("http://searchapi.scopus.com/search.url?&callback=?", params, function showScopusCitedBy(data){
      if (typeof data.OK == "undefined") return;

      var results = data.OK.Results;
      if (!results.length) return;

      var item = results[0];
    
      var items = [];
      if (item.citedbycount){
        items.push({
          text: item.citedbycount + " citations",
          url: item.inwardurl,
        });
      }

      if (typeof callback == "function") callback(item, items);
    });
  };
}

var plugin = new Plugin;
plugin.init();
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

    var params = { "apiKey": config.scopus, "search": "DOI(" + item.doi + ")" };
    $.getJSON("https://searchapi.scopus.com/documentSearch.url?&callback=?", params, function showScopusCitedBy(data){
      if (typeof data == "undefined" || !data.OK || !data.OK.results) return;

      var results = data.OK.results;
      if (!results.length) return;

      var result = results[0];

      var items = [];

      var count = Number(result.citedbycount);

      if (count){
        items.push({
          //text: count + " citation" + (count === 1 ? "" : "s"),
          text: count,
          url: result.inwardurl,
          icon: location.href + "sciverse.png"
        });
      }

      if (typeof callback == "function") callback(item, items);
    });
  };
}

var plugin = new Plugin;
plugin.init();
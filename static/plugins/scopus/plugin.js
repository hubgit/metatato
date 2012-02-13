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

        if (!item.doi) return;
      
        var params = { "devId": config.scopus, "search": "DOI(" + item.doi + ")" };
        $.getJSON("http://searchapi.scopus.com/search.url?&callback=?", params, function showScopusCitedBy(data){
          if (typeof data.PartOK == "undefined") return;

          var results = data.PartOK.Results;
          if (!results.length) return;

          var item = results[0];
        
          var items = [
            {
              text: item.citedbycount + " citations",
              url: item.inwardurl,
            }
          ];

          self.sendResponse(item, items);
        });
      break;
    }
  };

  this.sendResponse = function(item, items){
    var data = JSON.stringify(["item/" + item.id, items]);
    console.log(data);
    window.parent.postMessage(data, "*"); // TODO: actual parent domain
  };
}

var plugin = new Plugin;
plugin.init();
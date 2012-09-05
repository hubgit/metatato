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
        self.fetchLinks(data[1], self.sendResponse);
      break;
    }
  };

  this.sendResponse = function(item, items){
    var data = ["item/" + item.id, items];
    window.parent.postMessage(data, "*"); // TODO: actual parent domain
  };

  this.fetchLinks = function(item, callback){
    if (!item.pmid) return;

    var eutils = new EUtils(config.eutils.name, config.eutils.email);
    eutils.link(item.pmid, function handleSearchResponse(xml, status, xhr){
      var items = eutils.parseLinkOut(xml);
      if (typeof callback == "function") callback(item, items);
    }, { "cmd": "prlinks", "usehistory": "n" });
  };
}

var plugin = new Plugin;
plugin.init();
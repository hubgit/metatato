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

        if (!item.pmid) return;
      
        var eutils = new EUtils(config.eutils.name, config.eutils.email);
        eutils.link(item.pmid, function handleSearchResponse(xml, status, xhr){
          var items = eutils.parseLinkOut(xml);
          console.log(items);
          self.sendResponse(item, items);
        }, { "cmd": "prlinks", "usehistory": "n" });
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
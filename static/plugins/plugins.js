var Plugins = function(){
  var self = this;
  
  this.init = function(){
    window.addEventListener("message", self.receiveMessage, false);

    self.plugins = window.parent.app.plugins;
    
    $.each(self.plugins.plugins, function(type, plugins){
      $.each(plugins, self.loadPlugin);
    });
  };
  
  this.knownOrigin = function(event){
    $.each(self.plugins.plugins, function(type, plugins){
      for (var id in plugins){
        var plugin = plugins[id];
        if (event.origin === plugin.url) return plugin;
      }
    });
  };
  
  this.receiveMessage = function(event){
    console.log(event);
    var plugin = self.knownOrigin(event);
    //if (!plugin) return false;
    
    var data = JSON.parse(event.data);
    var url = data[0].split("/");
    var results = data[1];
    
    switch (url[0]){
      case "item":
        results.forEach(function(result){
          window.parent.itemController.showPluginResult(url[1], result);
        });
      break;

      case "items":
        window.parent.saveItem(results);
      break; 
    }
  };
  
  this.loadPlugin = function(id, plugin){
    var i = $("<iframe/>", { "class": "plugin", "src": plugin.url, "id": "plugin-" + id  }).appendTo("body");
  };
  
  this.get = function(id, url, data){
    var message = JSON.stringify([url, data]);
    $("#plugin-" + id).get(0).contentWindow.postMessage(message, "*"); // TODO: origin of target window
  };  
};

var plugins = new Plugins;
plugins.init();
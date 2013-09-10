// TODO: put this in an iframe
var Plugins = function(){
  var self = this;

  this.plugins = {
    "itemSelected": {
        "altmetric": {
          "url": "altmetric/",
          "fields": ["doi", "pmid"],
        },
        /*"scopus": {
          "url": "scopus/",
          "fields": ["doi"],
        },*/
        "linkout": {
          "url": "linkout/",
          "fields": ["pmid"],
        },
        "related": {
          "url": "related/",
          "fields": ["pmid"],
        },
    }
  };

  this.init = function(){
    app.pluginsWindow = $("<iframe/>", { id: "item-plugins", type: "text/html", src: "static/plugins/" })
      .on("item-selected", self.itemSelected)
      .appendTo("body");
  };

  this.itemSelected = function(event){
    var target = app.pluginsWindow.get(0).contentWindow.plugins;
    $.each(self.plugins.itemSelected, function(id, plugin){
      //console.log([plugin, app.item.data, self.sanitiseItem(plugin, app.item.data)]);
      target.get(id, "item", self.sanitiseItem(plugin, app.item.data));
    });
  };

  this.sanitiseItem = function(plugin, item){
    var output = { "id": item.id };
    plugin.fields.forEach(function(field){
      if (field in item) output[field] = item[field];
    });
    return output;
  };
}

app.plugins = new Plugins;
app.plugins.init();
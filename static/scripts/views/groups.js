Views.GroupsView = function(options) {
  var self = this;
  var container = $(options.container);
  var id = "groups-list";

  this.render = function(){
    console.log("Rendering " + id);
    container.find("#" + id).remove();

    self.node = $("<div/>", { class: "facet-list group", id: id });

    options.items.map(function(data){
      var facet = {
        path: "groups",
        query: "?group=" + encodeURIComponent(data.id),
        hash: "#groups-items",
        id: "group-facet-" + data.id,
        title: data.name,
        count: data.size,
        selected: data.selected,
      }
      var template = $("#facet-template").html();
      $(Mustache.to_html(template, facet)).data("group", data).appendTo(self.node);
    });

    self.node.appendTo(container);
  };

  return this;
};

Views.GroupsHeaderView = function(options) {
  var self = this;
  var container = $(options.container)
  var id = "options.id";
  
  this.render = function(){
    container.find("#" + id).remove();
    self.node = $("<div/>", { id: id }).appendTo(container);      
    
    var template = $("#groups-header-template").html();
    var node = $(Mustache.to_html(template, {}));
    self.node.append(node);
  }
};
var Tags = function(){
  var self = this;
  this.itemsPerPage = 20;
  
  this.bind = function(){
    $("html")
      .on("updated.weblibrary", "#collection", self.collectionUpdated)
      .on("click", "#main-tags a", function(){ alert("Not implemented yet"); return false; });    
  };
  
  this.collectionUpdated = function(event){
    var counts = library.countTags(app.collection);
        
    var max = 0;
    var tags = $.map(counts, function(count, tag){
      max = Math.max(max, count);
      return { name: tag, count: count };
    });
    
    var tagsView = new Views.TagsView({ container: this, tags: tags, max: max });
    tagsView.render();
    tagsView.node.click();
  };
}

var tags = new Tags;
tags.bind();

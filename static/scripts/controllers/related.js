var SectionRelatedController = function(){
  var self = this;
  this.init("related", ["sources", "items", "item"]);
  
  this.pagesRendered = function(){
    $(document).on("click", ".related-source", self.fetchItems)
    self.renderSourcesPage();
  };
  
  this.renderSourcesPage = function(){
    var items = [
      { title: "PubMed Related", id: "pubmed", class: "related-source" }
    ];
    
    var view = new Views.RelatedView({ container: self.pages.sources.contentNode, items: items });
    view.render();
  };
  
  this.fetchItems = function(event){
    var node = $(this);
    var source = node.data("source");
    console.log(source);

    var pmid = app.item.data.pmid;
    if (!pmid) return;
    console.log(pmid);
    
    switch (source.id){
      case "pubmed":
      var eutils = new EUtils("test", "alf@hubmed.org");
      eutils.link(pmid, function handleSearchResponse(xml, status, xhr){
        var ids = eutils.parseLink(xml);

        eutils.summaryFromIds(ids.slice(0, 20), function(xml, status, xhr){
          var results = eutils.parseSummary(xml);

          var view = new Views.ItemsView({ 
            container: "#related-items", 
            collection: results, 
            id: "related-collection", 
            itemsPerPage: 20,
            showCollected: app,
          });
          view.render();
          //setActiveNode(self.pages.items.view.node);
        }, 
        { retstart: 1, retmax: 20 });
      }, 
      { retstart: 1 });
      break;
    }
  };
}

SectionRelatedController.prototype = new Section;
new SectionRelatedController;


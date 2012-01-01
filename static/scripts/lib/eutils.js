var EUtils = function(tool, email){
  var self = this;
  
  this.tool = tool;
  this.email = email;
  
  this.base = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/";
  this.db = "pubmed";
  
  this.first = function(node, selector){
    return node.children(selector).filter(":first").text();
  };
  
  this.firstItem = function(node, name){
    return self.first(node, "Item[Name='" + name + "']");
  };
  
  this.link = function(id, callback, params){
    $.get(this.base + "elink.fcgi", $.extend({}, {
      "db": self.db,
      "retstart": 0,
      "retmax": 1,
      "retmode": "xml",
      "usehistory": "y",
      "tool": self.tool,
      "email": self.email,
      "id": id
    }, params), callback, "xml");
  };
  
  this.search = function(q, callback, params){
    $.get(this.base + "esearch.fcgi", $.extend({}, {
      "db": self.db,
      "retstart": 0,
      "retmax": 1,
      "retmode": "xml",
      "usehistory": "y",
      "tool": self.tool,
      "email": self.email,
      "term": q
    }, params), callback, "xml");
  };
  
  this.parseSearch = function(xml){ 
    var x = $("eSearchResult", xml);
    return {
      "count": self.first(x, "Count"),
      "webenv": self.first(x, "WebEnv"),
      "querykey": self.first(x, "QueryKey"),
      "query": self.first(x, "QueryTranslation"),
      "retstart": self.first(x, "RetStart"),
    }
  };
  
  this.parseLink = function(xml){
    return $.makeArray($(xml).find("LinkSetDb:first Link > Id").map(function(item){
      return $(this).text();
    }));
  };
  
  this.summaryFromIds = function(ids, callback, params){
    $.get(this.base + "esummary.fcgi", $.extend({}, {
      "db": self.db,
      "id": ids.join(","),
      "tool": self.tool,
      "email": self.email,
      "retstart": 0,
      "retmax": 10,
      "retmode": "xml"
    }, params), callback, "xml");
  };
  
  this.summary = function(searchResults, callback, params){    
    $.get(this.base + "esummary.fcgi", $.extend({}, {
      "db": self.db,
      "WebEnv": searchResults.webenv,
      "query_key": searchResults.querykey,
      "tool": self.tool,
      "email": self.email,
      "retstart": 0,
      "retmax": 10,
      "retmode": "xml"
    }, params), callback, "xml");
  };
  
  this.parseSummary = function(xml){    
    return $.makeArray($(xml).find("eSummaryResult > DocSum").map(self.parseSummaryItem));
  };
  
  this.parseSummaryItem = function(i, doc){
    var x = $(doc);
    return {
      "type": "Journal Article",
      "id": self.first(x, "Id"),
      "identifiers": {
        "pmid": self.first(x, "Id"),
      },
      "year": self.firstItem(x, "PubDate").match(/^(\d+)/)[1],
      "title": self.firstItem(x, "Title"),
      "volume": self.firstItem(x, "Volume"),
      "issue": self.firstItem(x, "Issue"),
      "publication_outlet": self.firstItem(x, "Source"),
      //"so": self.firstItem(x, "SO"),
      "pages": self.firstItem(x, "Pages"),
      "issn": self.firstItem(x, "ISSN"),
      "essn": self.firstItem(x, "ESSN"),
      //"abstract": self.firstItem(x, "HasAbstract"),
      "authors": $.makeArray(x.find("Item[Name='AuthorList'] > Item").map(function(){ return this.textContent })).map(self.prepareAuthors),
    }
  };
  
  this.prepareAuthors = function(item){
      return { fullname: item };
  };
}

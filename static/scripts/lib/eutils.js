var EUtils = function(tool, email){
  var self = this;

  this.tool = tool;
  this.email = email;

  this.base = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/";
  this.db = "pubmed";

  this.first = function(node, selector){
    var item = node.children(selector).filter(":first");
    return item.length ? item.text() : null;
  };

  this.firstItem = function(node, name){
    return self.first(node, "Item[Name='" + name + "']");
  };

  this.link = function(id, callback, params){
    var data = {
      "db": self.db,
      "retstart": 0,
      "retmax": 1,
      "retmode": "xml",
      "usehistory": "n",
      "tool": self.tool,
      "email": self.email,
      "id": id
    };

    $.get(this.base + "elink.fcgi", $.extend(data, params), callback, "xml");
  };

  this.search = function(q, callback, params){
    var data = {
      "db": self.db,
      "retstart": 0,
      "retmax": 1,
      "retmode": "xml",
      "usehistory": "y",
      "tool": self.tool,
      "email": self.email,
      "term": q
    };

    $.get(this.base + "esearch.fcgi", $.extend(data, params), callback, "xml");
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

  this.parseLinkOut = function(xml){
    var objurl = $(xml).find("LinkSet:first > IdUrlList:first > IdUrlSet:first > ObjUrl");
    if (!objurl.length) return [];

    var seen = {};

    return $.map(objurl, function(item){
      item = $(item);

      var url = item.find("Url:first").text();

      if (seen[url]) return;
      seen[url] = true;

      var provider = item.find("Provider:first > Name:first").text();

      return {
        url: url,
        text: provider ? provider : "LinkOut",
      };

    });
  };

  this.parseRelatedArticles = function(xml){
    var sets = $(xml).find("LinkSet:first > LinkSetDb");
    if (!sets.length) return {};

    var items = {};
    $.each(sets, function(index, item){
      item = $(item);
      var db = item.find("LinkName:first").text();
      items[db] = [];

      item.find("Link > Id").each(function(index, id){
        items[db].push(id.textContent);
      });
    });
    return items;
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
    var $doc = $(doc);
    return {
      "type": "Journal Article",
      "id": self.first($doc, "Id"),
      "pmid": self.first($doc, "Id"),
      "identifiers": {
        "pmid": self.first($doc, "Id"),
        "doi": self.firstItem($doc.find("Item[Name='ArticleIds']"), "doi"),
      },
      "year": self.firstItem($doc, "PubDate").match(/^(\d+)/)[1],
      "title": self.firstItem($doc, "Title"),
      "volume": self.firstItem($doc, "Volume"),
      "issue": self.firstItem($doc, "Issue"),
      "publication_outlet": self.firstItem($doc, "Source"),
      //"so": self.firstItem($doc, "SO"),
      "pages": self.firstItem($doc, "Pages"),
      "issn": self.firstItem($doc, "ISSN"),
      "essn": self.firstItem($doc, "ESSN"),
      //"abstract": self.firstItem($doc, "HasAbstract"),
      "authors": $.makeArray($doc.find("Item[Name='AuthorList'] > Item").map(function(){ return this.textContent })).map(self.prepareAuthors),
    }
  };

  this.prepareAuthors = function(item){
      return { fullname: item };
  };
}

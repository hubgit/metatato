$(document).ajaxSend(function onAjaxSend(event, jqXHR, settings) {
  if (settings.type != "GET" && isSameDomain(settings.url, window.location.href)) { // GET a URL on the sameDomain
    jqXHR.setRequestHeader("x-csrf-token", $.cookie("csrf"));
  }
  if (settings.url.match(/^api\//) && window.location.pathname.match("/plugins/")){
    settings.url = "../../../" + settings.url;
  }
});

$(document).ajaxError(function onAjaxError(event, jqXHR, settings, thrownError) {
  console.log([this, event, jqXHR, settings, thrownError]);
  switch (thrownError){
    case "Forbidden":
      app.authenticationSuccess = function(profile){
        $.modal.close();
        $.ajax(settings);
      };
      
      var box = $("<iframe/>", { src: "auth" });
      box.modal({ opacity: 50, overlayClose: true, minHeight: 302, minWidth: 453 });
    break;
    
    default:
    break;
  }
});

$(document).on("click", "a[rel=external]", function openExternalLink(event){
  event.preventDefault();
  window.open(this.href, "External");
  return false;
});

$(document).on("click", "a[rel=modal]", function openModalLink(event){
  event.preventDefault();
  
  var page = $(this).closest("[data-role=page]");
  
  var header = page.find("[data-role=header]");
  header.find(".metadata, .upload").hide();
  
  var content = page.find("[data-role=content]");
  $("<iframe/>", { name: "read", "data-role": "content", src: this.href, mozallowfullscreen: true }).replaceAll(content).css("display", "block");
  
  //$("<iframe/>", { src: this.href }).modal({ opacity: 50, overlayClose: true);
  return false;
});

var isSameDomain = function(a, b){
  return $("<a/>", { "href": a }).get(0).hostname == $("<a/>", { "href": b }).get(0).hostname;
}

var setMessage = function(page, message, header){
  var node = header ? page.headerNode : page.contentNode;
  node.empty();
  if (message) $("<div/>", { class: "items-message" }).html(message).appendTo(node);  
}

var setActiveNode = function(node){
  $(node).addClass("active").siblings(".active").removeClass("active");
}

var setActiveLinks = function(node){
  if (!node) node = document;
  var path = decodeURIComponent(app.currentPath);
  console.log([node, path]);
  var links = $("a", node).filter(function(){ return $(this).attr("href") == path; });
  console.log(links);
  $("a.active", node).removeClass("active");
  if (links.length) links.each(function(i, node){ setActiveNode(node); });
}

var parseQueryString = function(search){  
  if (!search) return {};
  
  var params = {},
    e,
    a = /\+/g,  // Regex for replacing addition symbol with a space
    r = /([^&=]+)=?([^&]*)/g,
    d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
    q = search;

  while (e = r.exec(q)) params[d(e[1])] = d(e[2]);
  return params;
}

var buildQueryString = function(search){
  if (!search) return "";
  var parts = [];
  $.each(search, function(key, value){
    if (value.length) parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
  });
  return parts.length ? "?" + parts.join("&") : "";
}

var buildUrl = function(parts){
  var location = $.extend(true, {}, app.location, parts);
  var url = location.path;
  if (location.query) url += buildQueryString(location.query);
  if (location.hash) url += "#" + location.hash;
  return url;
};

// need to prepend all the field name with field-, so that Mustache doesn't get confused by parent item properties
var prepareFields = function(fields){
  var data = {};
  
  $.each(fields, function(type, items){
   data[type] = {};
    $.each(items, function(field, item){
      var newField = {};
      $.each(item, function(key, value){
        newField["field-" + key] = value;
      });
      data[type][field] = newField;
    });
  });
  
  return data;
}

var cleanNode = function(node){
  node.headerNode.empty(); 
  node.contentNode.empty();
  return node;
};

/** Test for the presence of a PDF plugin - adapted from PDFObject **/
var detectPDFPlugin = function(){
  // generic PDF plugin
	if (navigator.mimeTypes["application/pdf"] && navigator.mimeTypes["application/pdf"].enabledPlugin) return true;
	
  // Adobe Reader in non-IE browsers
  for (var i = navigator.plugins.length - 1; i >= 0; i--){
    if (navigator.plugins[i].name.match(/(Adobe Reader|Adobe PDF|Acrobat)/i)) return true;
  }
  
  // Adobe Reader in IE
  return Boolean(window.ActiveXObject && (new ActiveXObject("AcroPDF.PDF") || new ActiveXObject("PDF.PdfCtrl")));
}

var convertCatalogDocToInputDoc = function(data){
  var doc = {};

  // TODO: use Mendeley fields
  ["abstract", "issue", "pages", "title", "type", "volume", "website", "year", 
  "authors", "editors", "translators", "producers", "cast",
  "doi", "pmid", "issn", "arxiv", "isbn", "scopus", "ssm"].forEach(function(field){
    if (typeof data[field] != "undefined" && data[field].length) doc[field] = data[field];
  });
  
  if (typeof data["identifiers"] == "object"){
    ["doi", "pmid", "arxiv", "issn", "isbn", "scopus", "ssm"].forEach(function(field){
      var value = data["identifiers"][field];
      if (typeof value != "undefined" && value.length) doc[field] = value;
    });
  }
  
  if (data.published_in) doc.published_in = data.published_in;
  else if (data.publication_outlet) doc.published_in = data.publication_outlet;
  
  /*
  if (typeof data["identifiers"] == "object"){
    doc["identifiers"] = {};
    $.each(data["identifiers"], function(field, value){
       if (value) doc["identifiers"][field] = value;
    });
  }
  */
  
  return doc;
};

var saveItem = function(doc, button, canonicalData){
  $.post("api/documents", doc, function(data, status, xhr){
    if (status != "success"){
      button.removeClass("loading").addClass("error");
      return;
    }
        
    var documentURL = xhr.getResponseHeader("Location");
    var matches = documentURL.match(/(\d+)$/);
    var documentId = matches[1];
    
    if (!documentId){
      button.removeClass("loading").addClass("error");
      return;
    }
    
    $.getJSON("api/documents/" + documentId, function(data){
      console.log(data);
      button.removeClass("loading");
      if (!data || !data.id) return;

      if (canonicalData){
        data.canonical = canonicalData;
        data.oa_journal = canonicalData.oa_journal;
      }

      app.objectStore.put(data, function(event){
        button.text("Added").closest(".item").addClass("in-library");
      });
    });
  }, "json");
};
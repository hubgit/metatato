$(document).ajaxSend(function onAjaxSend(event, jqXHR, settings) {
  if (settings.type != "GET" && isSameDomain(settings.url, window.location.href)) { // GET a URL on the sameDomain
    jqXHR.setRequestHeader("x-csrf-token", $.cookie("csrf"));
  }
});

$(document).ajaxError(function onAjaxError(event, jqXHR, settings, thrownError) {
  //console.log([this, event, jqXHR, settings, thrownError]);
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
});

var setMessage = function(page, message){
  console.log(page);
  var node = page.contentNode;
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

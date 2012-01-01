var console = console || { log: function() {}, error: function() {} };

["IndexedDB", "IDBTransaction", "IDBKeyRange", "IDBCursor", "RequestFileSystem", "RequestFullScreen", "URL"].forEach(function(value){
  window[value] = window[value] || window["webkit" + value] || window["moz" + value];
});

window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;


var isSameDomain = function(a, b){
  return $("<a/>", { "href": a }).get(0).hostname == $("<a/>", { "href": b }).get(0).hostname;
}
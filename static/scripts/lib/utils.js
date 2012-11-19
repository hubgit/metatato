if (typeof console == "undefined") window.console = { log: function() {}, error: function() {} };

["IndexedDB", "IDBTransaction", "IDBKeyRange", "IDBCursor", "RequestFileSystem", "RequestFullScreen", "URL"].forEach(function(value){
  window[value] = window[value] || window["webkit" + value] || window["moz" + value] || window["ms" + value] || window["o" + value];
});

if (window.indexedDB) {
  window.IndexedDB = window.indexedDB;
}

// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
    fToBind = this,
    fNOP = function () {},
    fBound = function () {
      return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
    };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

// http://stackoverflow.com/a/5186565/145899
(function($) {
  $.compare = function (arrayA, arrayB) {
    if (arrayA.length != arrayB.length) { return false; }
    
    // sort modifies the original array, so clone the arrays before sorting
    var a = jQuery.extend(true, [], arrayA);
    var b = jQuery.extend(true, [], arrayB);
    
    a.sort(); 
    b.sort();
    
    for (var i = 0, l = a.length; i < l; i++) {
      if (a[i] !== b[i]) return false;
    }
    
    return true;
  }
})(jQuery);
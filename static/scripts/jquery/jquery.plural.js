(function($) {
  $.plural = function(count, single, plural){
  	if (count === 1) return single;
  	if (plural) return plural;
  	return single + "s";
  }
})(jQuery);


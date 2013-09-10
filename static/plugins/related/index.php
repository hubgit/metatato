<? require __DIR__ . '/config.php'; ?>
<!doctype html>
<head>
  <meta charse="utf-8">
  <title>PubMed Related</title>

  <link rel="stylesheet" href="../../styles/elements.css">
  <link rel="stylesheet" href="../../styles/items.css">
  <link rel="stylesheet" href="../../styles/item.css">
  <link rel="stylesheet" href="plugin.css">
  <style>html, body { overflow: auto; }</style>
</head>

<body>
  <div id="filter">
    <a class="button active" href="#">All</a>
    <a class="button" href="#" data-days="365">1 year</a>
    <a class="button" href="#" data-days="730">2 years</a>
    <a class="button" href="#" data-days="1825">5 years</a>
  </div>

  <div id="related-items" data-role="page">
    <div data-role="header"></div>
    <div data-role="content">
      <div id="loading-items">Loading related articles from PubMed&hellip;</div>
      <div id="related-collection"></div>
    </div>
  </div>

  <script>
  var config = {
    "eutils": {
      "name": "<?= htmlspecialchars(EUTILS_NAME); ?>",
      "email": "<?= htmlspecialchars(EUTILS_EMAIL); ?>",
    },
  }
  </script>

  <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
  <script src="../../scripts/lib/eutils.js"></script>
  <script src="plugin.js"></script>

  <? if ($_GET['pmid']): ?>

  <script src="../../scripts/helpers.js"></script>
  <script src="../../scripts/lib/mustache.js"></script>
  <script src="../../scripts/jquery/jquery.cookie.js"></script>
  <script src="../../scripts/jquery/jquery.format-authors.js"></script>
  <script src="../../scripts/models/item.js"></script>
  <script>var Views = {};</script>
  <script src="../../scripts/views/items.js"></script>

  <script>
  var App = function(options) {
    var self = this;

    this.init = function(fields){
      $.getJSON("../../../fields", function(fields){
        self.allFields = prepareFields(fields);
        self.allTypes = $.map(fields, function(field, type){ return type; });

        var pmid = <?= (int) $_GET['pmid']; ?>;

        var filter = $("#filter");

        var filters = filter.find("a");

        filters.on("click", function(event) {
          event.preventDefault();
          var node = $(event.currentTarget);

          node.addClass("selected").siblings(".selected").removeClass("selected");

          plugin.relatedArticles({ pmid: pmid }, node.data("days"), plugin.renderResults);
        });

        filters[0].click();

        filter.show();
      });
    };
  };
  var app = new App;
  app.init();
  </script>
  <? endif; ?>
</body>

<script id="item-view-template" type="text/x-mustache+html">
  <div id="item-{{id}}" class="item">
  	<div class="metadata">
  	  <span class="year">{{year}}</span>

  	  <div class="links">
	      <a class="button patience-required" data-action="add">Add</a>
  		</div>

  		<div class="title {{#oa_journal}}open-access{{/oa_journal}}">{{title}}</div>

  		{{#publication_outlet}}<div class="journal-container">{{publication_outlet}}</div>{{/publication_outlet}}

  		{{#authorsCount}}
  		<div class="authors">
  		{{#authors}}
  		  {{#surname}}
  		  <span class="author">{{#forename}}{{forename}} {{/forename}}{{surname}}</span>
  		  {{/surname}}
  		  {{#fullname}}
  		  <span class="author">{{fullname}}</span>
  		  {{/fullname}}
  		{{/authors}}
  		</div>
  		{{/authorsCount}}
  	</div>
  </div>
</script>
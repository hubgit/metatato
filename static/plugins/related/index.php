<? require __DIR__ . '/config.php'; ?>
<!DOCTYPE html>
<head>
  <title>PubMed Related</title>
  <link rel="stylesheet" href="../../styles/elements.css">
  <link rel="stylesheet" href="../../styles/items.css">
  <link rel="stylesheet" href="../../styles/item.css">
  <link rel="stylesheet" href="plugin.css">
  <style>
  html, body { overflow: auto; }
  </style>
</head>

<body>
  <div id="related-items" data-role="page">
    <div data-role="header"></div>
    <div data-role="content">
      <div id="related-collection"><div id="loading-items">Loading related items&hellip;</div></div>
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
  
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
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
        plugin.relatedArticles({ "pmid": "<?= (int) $_GET['pmid']; ?>"}, plugin.renderResults);
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
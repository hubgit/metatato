<!doctype html>
<html x-manifest="appcache">

<head>
  <? require __DIR__ . '/head.html.php'; ?>

  <? require __DIR__ . '/styles.html.php'; ?>
  <!--<script src="static/scripts/lib/modernizr.js"></script>-->
</head>

<body class="sections" id="sections">
  <div id="loading">Loading&hellip;</div>

  <div class="sections-header">
    <div class="section-selectors"></div>
    <div class="sections-settings"></div>
  </div>

  <? require __DIR__ . '/templates.html'; ?>

  <script>var config = {};</script>
  <script>var baseURL = "<? h(trim(URL, '/')); ?>";</script>

  <? require __DIR__ . '/scripts.html.php'; ?>

  <img src="static/binary/loading-small.gif" style="display:none">
  <img id="drag-image" src="static/binary/doc.png" style="display:none">
</body>

</html>


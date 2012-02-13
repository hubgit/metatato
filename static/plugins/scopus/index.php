<? require __DIR__ . '/config.php'; ?>
<!DOCTYPE html>
<head>
  <title>Scopus</title>
  <script>
  var config = {
    "scopus": "<?= htmlspecialchars(SCOPUS_KEY); ?>",
  }
  </script>
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
  <script src="plugin.js"></script>
</head>

<body>
  
</body>
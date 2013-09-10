<? require __DIR__ . '/config.php'; ?>
<!DOCTYPE html>
<head>
  <title>Altmetric</title>
  <script>
  var config = {
    "altmetric": "<?= htmlspecialchars(ALTMETRIC_KEY); ?>",
  }
  </script>
  <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
  <script src="plugin.js"></script>
</head>

<body>

</body>
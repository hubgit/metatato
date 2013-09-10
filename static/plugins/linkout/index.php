<? require __DIR__ . '/config.php'; ?>
<!DOCTYPE html>
<head>
  <title>LinkOut</title>
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
</head>

<body>

</body>
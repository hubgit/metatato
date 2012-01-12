<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Metatato Authentication</title>
  <style>
  body {
    margin: 20px auto;
    width: 300px;
    text-align: center;
    font-family: "Helvetica", sans-serif;
  }
  button, input[type=submit]{
    display: inline-block;
    margin: 10px 0;
  }
  </style>
  <script>
  var authenticationSuccess = function(){
    if (window.parent.app){
      window.parent.app.authenticationSuccess();
    }
    else {
      window.opener.parent.app.authenticationSuccess();
      window.close();
    }
  }
  </script>
</head>
<body>
  <? if ($data): ?>
  <div>Signed in as <? h($data['name']); ?></div>
  <button onclick="authenticationSuccess()">Continue</button>
  <script>authenticationSuccess();</script>
  <? else: ?>
  <form onsubmit="window.open('auth?authorise=1', 'Authenticate'); return false;">
    <input type="hidden" name="authorise" value="1">
    <div>To allow Metatato to access your Mendeley account, please sign in and authorise this application</div>
    <input type="submit" value="Authorise">
  </form>
  <form method="post>
    
  <? endif; ?>
</body>
</html>

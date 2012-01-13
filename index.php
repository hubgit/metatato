<?php

require __DIR__ . '/config.php';
require LIBDIR . 'functions.php';
require LIBDIR . 'HTTPException.php';
require LIBDIR . 'Request.php';
require LIBDIR . 'Mendeley.php';
require LIBDIR . 'MendeleyUtil.php';
require LIBDIR . 'MendeleyOAuth.php';
require __DIR__ . '/route.php';

ob_start();
//('ob_gzhandler');

try {
  $request = new Request;
  list($data, $template) = route($request);
}
catch (HTTPException $e){
  $e->output();
  exit();
}

// TODO: mod_negotiation
if (strpos($_SERVER['HTTP_ACCEPT'], 'json') !== false){
  header('Content-Type: application/json; charset="utf-8"');
  print json_encode($data);
}
else if ($template){
  require 'templates/' . $template . '.html.php';
}

//ob_end_flush(); // gz_handler
header('Content-Length: ' . ob_get_length());
ob_end_flush();
exit();

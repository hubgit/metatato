<?php

error_reporting(E_ALL ^ E_NOTICE);

function h($text){
  //$text = mb_convert_encoding($text, 'UTF-8', mb_detect_encoding($text));
  print htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8'); // TODO: filter_var + FILTER_SANITIZE_SPECIAL_CHARS?
}

function url($url, $params = array()){
  if ($params) $url .= '?' . http_build_query($params);
  return $url;
}

function plural($count, $text, $plural = null){
  if (is_array($count)) $count = count($count);
  if ($count == 1) return $text;
  if ($plural) return $plural;
  return $text . 's';
}

function truncate_to_word($title, $max = 100){
  if (mb_strlen($title) <= $max) return $title;
  return current(explode("\n", wordwrap(str_replace("\n", ' ', $title), $max, "\n", true))) . '...';
}

// http://www.php.net/manual/en/function.apache-request-headers.php#72498
if (!function_exists('apache_request_headers')) { 
  $function = <<<'END'
    function apache_request_headers(){
      $headers = array();
      foreach ($_SERVER as $key => $value) { 
        if (substr($key, 0, 5) == 'HTTP_') { 
          $key = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5))))); 
          $headers[$key] = $value; 
        } 
      } 
      return $headers; 
    }
END;
  eval($function);
}
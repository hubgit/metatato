<?php

class Request {
  public $path;
  public $parts;
  public $type;
  public $internal;
  public $search;
  public $title;
 
  function __construct(){
    list($_GET, $this->internal) = $this->internal_params($_GET);

    $this->path = trim($this->internal['path'], '/');
    $this->parts = array_filter(explode('/', $this->path));
    $this->type = array_shift($this->parts);
    
    $this->csrf = $this->verify_csrf();
  }
  
  // move parameters that start with an underscore to a separate array
  function internal_params($items){
    $internal = array();
    
    foreach ($items as $key => $value){
      preg_match('/^_(.+)/', $key, $matches);
      if ($matches) { 
        $internal[$matches[1]] = $value;
        unset($items[$key]);
      }
    }

    $items = array_filter($items);  
    return array($items, $internal);
  }

  function input_to_file($dir){
	  $input = fopen('php://input', 'rb');

	  // create a temporary upload file and copy the (binary) POSTed information into it
	  $tmpfile = tempnam($dir, 'attachment-');
	  $output = fopen($tmpfile, 'w+b');
	  stream_copy_to_stream($input, $output);
	  fclose($input);
	  fclose($output);
	
	  return $tmpfile;
  }

  function verify_csrf(){
    $method = strtoupper($_SERVER['REQUEST_METHOD']);
    $csrf = $_COOKIE['csrf'];
        
    switch ($method){    
      case 'GET':
        if (!$csrf) {
          $csrf = uniqid();
          setcookie('csrf', $csrf, time() + 3600 * 24 * 365, '/');
        }
        return $csrf;
      
      case 'OPTIONS':
      case 'HEAD':
        return $csrf;
      
      case 'PUT':
      case 'POST':
      case 'DELETE':
        if (!$csrf) throw new HTTPException(403, 'CSRF token not available');
    
        $headers = array_change_key_case(apache_request_headers(), CASE_LOWER);
        if ($headers['x-csrf-token'] !== $csrf && $_POST['csrf'] !== $csrf) throw new HTTPException(403, 'CSRF token mismatch');
        return $csrf;
      
      default:
        throw new HTTPException(405);
    }
  }
}

<?php

require __DIR__ . '/OAuth.php';

if (!defined('MENDELEY_SERVER')) define('MENDELEY_SERVER', 'http://api.mendeley.com/');
define('MENDELEY_API_URL', MENDELEY_SERVER . 'oapi/');
define('MENDELEY_AUTH_URL', MENDELEY_SERVER . 'oauth/');

class MendeleyOAuth {   
  static function fetch($method, $path, $params = array(), $headers = array(), $curl_params = array()){
    if (is_array($path)) $path = MendeleyUtil::build_path($path);

    $consumer = new OAuthConsumer(MENDELEY_CONSUMER_KEY, MENDELEY_CONSUMER_SECRET, null);
    
    $token = self::access_token();
    $request = OAuthRequest::from_consumer_and_token($consumer, $token, $method, MENDELEY_API_URL . $path,	$params);
    $request->sign_request(new OAuthSignatureMethod_HMAC_SHA1, $consumer, $token);		

    $url = MENDELEY_API_URL . $path;
    if ($method == 'GET' && $params) $url .= '?' . http_build_query($params);

    $curl = curl_init($url);
    
    $default_headers = array(
      'Connection: Close', 
      'Expect: '
    );

    curl_setopt_array($curl, $curl_params + array(
      CURLOPT_HTTPHEADER => array_merge($headers, $default_headers, (array) $request->to_header()), // oauth in the Authorization header
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_CONNECTTIMEOUT => 30,
      CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
    ));

    $response = curl_exec($curl);
    //error_log(print_r($response, true));
    //print_r($url); print_r($response); exit();

    $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    //if ($code >= 400) throw new HTTPException($code, $response); // TODO: only for debugging - use this one to see the actual response
    if ($code >= 400) throw new HTTPException($code);

    if ($curl_params[CURLOPT_RETURNTRANSFER] === false) {
      header('Content-Type: ' . curl_getinfo($curl, CURLINFO_CONTENT_TYPE));
      header('Content-Length: ' . curl_getinfo($curl, CURLINFO_CONTENT_LENGTH_DOWNLOAD));
      exit();
    }

    $data = array(
      'code' => $code,
      'head' => curl_getinfo($curl),
      'body' => $response,
      );

    curl_close($curl);
    return $data;
  }

  static function get($path, $params = array()){
    $result = self::fetch('GET', $path, $params);
    return json_decode($result['body'], true);
  }

  static function post($path, $params = array()){
    $curl_params = array(
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => $params,
      );
    $result = self::fetch('POST', $path, array(), array(), $curl_params);
    return json_decode($result['body'], true);
  }

  static function put($path, $file, $filename, $type = 'application/pdf'){
    $params = array('oauth_body_hash' => sha1_file($file));
    $headers = array(
      'Content-Type: ' . preg_replace('/\s/', '', $type),
      sprintf('Content-Disposition: attachment; filename="%s"', preg_replace('/\s+/', ' ', $filename))
      );
    $curl_params = array(
      CURLOPT_PUT => true,
      CURLOPT_INFILE => fopen($file, 'r'),
      CURLOPT_INFILESIZE => filesize($file),
      );
    return self::fetch('PUT', $path, $params, $headers, $curl_params);
  }

  static function access_token(){
    $token = json_decode(stripslashes($_COOKIE['oauth-access']), true);
    if (!$token) throw new HTTPException(403, 'Access token not available');
    return new OAuthConsumer($token['token'], $token['secret']);
  }

  static function request_token(){
    $token = json_decode(stripslashes($_COOKIE['oauth-request']), true);
    if (!$token) throw new HTTPException(403, 'Request token not available');
    return new OAuthConsumer($token['token'], $token['secret']);
  }

  static function fetch_access_token(){
   // fetch a request token and authorise it
    if (!$_GET['oauth_verifier']) return self::authorise_request_token();

    // use the request token to fetch an access token
    $token = self::fetch_token('access_token/', self::request_token(), array('oauth_verifier' => $_GET['oauth_verifier']));
    if (!$token) throw new HTTPException(403, 'Failed to fetch an access token');

    $token = self::set_oauth_cookie('access', $token);
    self::set_oauth_cookie('request', null);

    return new OAuthConsumer($token['token'], $token['secret']);
  }

  static function authorise_request_token(){
    $token = self::fetch_token('request_token/');
    if (!$token['oauth_token']) throw new HTTPException(403, 'Failed to fetch a request token');
    self::set_oauth_cookie('request', $token);

    $params = array('oauth_token' => $token['oauth_token'], 'oauth_callback' => 'http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI']);
    header('Location: ' . MENDELEY_AUTH_URL . 'authorize/?' . http_build_query($params));
    exit();
  }

  static function fetch_token($path, $token = null, $params = array()){
    $url = MENDELEY_AUTH_URL . $path;

    $consumer = new OAuthConsumer(MENDELEY_CONSUMER_KEY, MENDELEY_CONSUMER_SECRET, null);
    $request = OAuthRequest::from_consumer_and_token($consumer, $token, 'GET', $url, $params);
    $request->sign_request(new OAuthSignatureMethod_HMAC_SHA1, $consumer, $token);

    $curl = curl_init($url);

    curl_setopt_array($curl, array(
    CURLOPT_HTTPHEADER => array(
      $request->to_header(),
      'Connection: Close', 
      ),
      CURLOPT_RETURNTRANSFER => true,
      ));

    $response = curl_exec($curl);

    $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($code >= 400) throw new HTTPException($code);

    parse_str($response, $token);
    return $token;
  }

  static function set_oauth_cookie($type, $token){
    if ($token){
      $token = array('token' => $token['oauth_token'], 'secret' => $token['oauth_token_secret']);
    }
    else {
      unset($_COOKIE['oauth-' . $type]);
    }
    setcookie('oauth-' . $type, $token ? json_encode($token) : null, time() + (60 * 60 * 24 * 365), '/', null, false, true);
    return $token;
  }
  
  static function logout(){
    foreach(array('oauth-access', 'oauth-request', 'csrf') as $cookie){
      setcookie($cookie, null, time() - (60 * 60 * 24 * 365), '/', null, false, true);
    }
    header('Location: http://www.mendeley.com/logout/');
    exit();
  }
}


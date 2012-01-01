<?php

class API {
  static function soap($wsdl, $method){
    $args = func_get_args();

    try{
      $client = new SOAPClient($wsdl, array(
        'features' => SOAP_SINGLE_ELEMENT_ARRAYS,
        'trace' => 1,
        //'compression' => SOAP_COMPRESSION_ACCEPT | SOAP_COMPRESSION_GZIP,
      ));
      return call_user_func_array(array($client, $method), array_slice($args, 2));
    } 
    catch (SoapFault $exception) { } // FIXME: proper error handling
  }
}

class OpenCitation {
  static function citations($doi){
    
  }
  
  static function citedby($doi){
    
  }
}

class Whatizit {
  static $wsdl = 'http://www.ebi.ac.uk/webservices/whatizit/ws?wsdl';
  
  static function pmid($pmid, $plan = 'whatizitUkPmcGenesProteins'){
    
  }
  
  static function annotate($text, $plan = 'whatizitUkPmcGenesProteins'){
    $timeout = ini_get('default_socket_timeout');
    ini_set('default_socket_timeout', 60 * 5); // 5 minutes
    
    $params = array('text' => $text, 'pipelineName' => $plan, 'convertToHtml' => FALSE);
    $data = API::soap(self::$wsdl, 'contact', $params);

    ini_set('default_socket_timeout', $timeout);

    $xml = $data->return;
    if (!$xml) return array(); // TODO: throw HTTPException?
    
    $xml = preg_replace('/<!--.+?-->/s', '', $xml);

    $dom = new DOMDocument;
    $dom->preserveWhiteSpace = true;
    $dom->loadXML($xml, LIBXML_DTDLOAD | LIBXML_DTDVALID | LIBXML_NOCDATA | LIBXML_NOENT | LIBXML_NONET);
    $dom->encoding = 'UTF-8';
    $dom->formatOutput = FALSE;

    if (!is_object($dom)) return;
    
    $xpath = new DOMXPath($dom);
    $xpath->registerNamespace('ebi', 'http://www.ebi.ac.uk/z');
    
    $items = array();
    $nodes = $xpath->query("//ebi:uniprot");
    foreach ($nodes as $node){
      if (!isset($items[$node->textContent])){
        $items[$node->textContent] = explode(',', $node->getAttribute('ids'));
      }
    }
    
    $annotations = array();
    foreach ($items as $title => $ids){
      $annotations[] = array(
        'title' => $title,
        'identifiers' => $ids,
        );
    }
    
    return $annotations;
  }
}
<?php

class MendeleyUtil {
  static function build_path($parts = array()){
  	return implode('/', array_map('rawurlencode', array_filter($parts))) . '/';
  }
  
	static function verify_item($data, $filter = true){
		if ($filter) $data = array_filter($data);
	
		$data['identifiers'] = array_fill_keys(array('arxiv', 'doi', 'issn', 'isbn', 'pmid', 'scopus', 'ssm'), null);
		
	  foreach ($data as $key => $value){
	    // convert empty strings and arrays to null
	  	if (!$value) $data[$key] = $value = null;
	  			
			switch ($key){
				// unwanted fields
				case 'import-pdf':
				case 'import-html':
					unset($data[$key]);
				break;
			
				// identifiers
				case 'arxiv':
				case 'doi':
				case 'issn':
				case 'isbn':
				case 'pmid':
				case 'scopus':
				case 'ssm':
					$data['identifiers'][$key] = $value;
					unset($data[$key]);
				break;

				// see "relationships" in the Document domain
				// convert string form input values to arrays
				case 'authors':
				case 'editors':
				case 'translators':
				case 'producers':
				case 'cast':
					$data[$key] = is_string($value) ? self::string_to_array($value) : array();
				break;
				
				case 'tags':
				case 'keywords';
						$data[$key] = is_string($value) ? self::string_to_array($value) : array();
				break;
			}		
		}
	
		// TODO: set a whitelist of fields; use JSON definition file
		return $data;
	}
	
	static function string_to_array($value){
		return array_filter(array_map('trim', preg_split('/[\r\n;]+/', $value, null, PREG_SPLIT_NO_EMPTY)));
	}

	
	static function format_authors($authors, $max = 3){
		$items = array();
		
		foreach ($authors as $item){
		  $name = ucfirst($item['surname']);
		  //if ($item['forename']) $name .= ', ' . strtoupper(substr($item['forename'], 0, 1));
		  if ($item['forename']) $name = $item['forename'] . ' ' . $name;
		  $items[] = $name;
		}
		
		return array(array_slice($items, 0, $max), count($items), $max);
	}
	
	static function preview_url($filehash){
		if (!$filehash) return URL . '/files/no-preview.png';
		return 'http://s3.amazonaws.com/mendeley-pdf-previews/' . substr($filehash, 0, 2) . '/' . substr($filehash, 2, 2) . '/' . $filehash . '_tn.png';
	}

	static function sanitise_url($path, $items){
		$url = $path;
		
		array_walk($items, function(&$value, $key){
		  if (substr($key, 0, 1) === '_') $value = null;
		});
		
		$items = array_filter($items);
		if ($items) $url .= '?' . http_build_query($items);
		
		return $url;
	}
	
	static function catalog_params($params, $uuid = null){
    if ($uuid) return array($uuid, null);
    if ($params['doi']) return array($params['doi'], 'doi');
    if ($params['pmid']) return array($params['pmid'], 'pmid');
	}
}

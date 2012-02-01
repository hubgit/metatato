<?php

class Mendeley {
  static function fetch($path, $params = array()) {
  	if (is_array($path)) $path = MendeleyUtil::build_path($path);
    $params['consumer_key'] = MENDELEY_CONSUMER_KEY;
    $url = MENDELEY_SERVER . 'oapi/' . $path . '?' . http_build_query($params);
    $data = file_get_contents($url);
    if (!$data) return array();
    return json_decode($data, true);
  }

  // http://apidocs.mendeley.com/home/public-resources/search-details
  static function document($id, $type = null) {
    if ($type == 'doi') $id = str_replace('/', '%2F', $id); // workaround
    return self::fetch(array('documents', 'details', $id), array('type' => $type));
  }

  // http://apidocs.mendeley.com/home/public-resources/public-groups-details
  static function group($id, $section = 'main') {
    return self::fetch(array('documents', 'groups', $id));
  }

  // http://apidocs.mendeley.com/home/public-resources/search-terms
  static function search($type = 'documents', $q, $page = 0, $items = 20){
    return self::fetch(array($type, 'search', $q), array('page' => $page, 'items' => $items));
  }

  // http://apidocs.mendeley.com/home/user-specific-methods/profile-information
  static function profile($id, $section = 'main') {
    return MendeleyOAuth::get(array('profiles', 'info', $id), array('section' => $section));
  }

  // http://apidocs.mendeley.com/home/user-specific-methods/user-library-document-details
  static function library($id, $type = 'documents', $page = 0, $items = 20, $since = 0) {
    $params = $id ? null : array('page' => (int) $page, 'items' => (int) $items, 'since' => (int) $since, 'sort' => 'modified-asc');
    return MendeleyOAuth::get(array('library', $type, $id), $params);
  }

  // http://apidocs.mendeley.com/home/user-specific-methods/user-library-create-document
  static function library_add_item($data) {
    return MendeleyOAuth::post(array('library', 'documents'), array('document' => json_encode(MendeleyUtil::verify_item($data))));
  }
  
  // http://apidocs.mendeley.com/home/user-specific-methods/user-library-create-document
  static function library_update_item($id, $data) {
    return MendeleyOAuth::post(array('library', 'documents', $id), array('document' => json_encode(MendeleyUtil::verify_item($data, false))));
  }

  // http://apidocs.mendeley.com/home/user-specific-methods/file-upload
  static function library_add_file($id, $file, $filename, $type = 'application/pdf'){
  	return MendeleyOAuth::put(array('library', 'documents', $id), $file, $filename, $type);
  }

  // http://apidocs.mendeley.com/home/user-specific-methods/user-library-folder
  // http://apidocs.mendeley.com/user-library-folder-documents
  static function library_folders($id = null){
    return MendeleyOAuth::get(array('library', 'folders', $id));
  }

  // http://apidocs.mendeley.com/home/user-specific-methods/user-library-group-documents
  static function library_groups($id = null){
    return MendeleyOAuth::get(array('library', 'groups', $id));
  }
  
  // http://apidocs.mendeley.com/home/user-specific-methods/group-document-details
  static function library_group_document($group, $id){
    return MendeleyOAuth::get(array('library', 'groups', $group, $id));
  }

  // http://apidocs.mendeley.com/user-library-add-document-to-folder
  static function set_document_folder($id, $folder){
  	return MendeleyOAuth::post(array('library', 'folders', $folder, $id));
  }

  // http://apidocs.mendeley.com/home/user-specific-methods/download-file
  static function library_readfile($id, $filehash, $groupId){
    //ob_end_flush(); // gz_handler
    //ob_end_flush(); // can't do this to output directly, as need to pass headers from curl (but not all of them)
    $curl_params = array(CURLOPT_RETURNTRANSFER => false, CURLOPT_HEADER => false); // output directly
    $url = array('library', 'documents', $id, 'file', $filehash, $groupId);
    return MendeleyOAuth::fetch('GET', $url, array(), array(), $curl_params);
  }
}


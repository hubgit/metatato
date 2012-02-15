<?php

function route($request){
  switch ($request->type){
    case '':
      if ($_COOKIE['oauth-access']){
        header('Location: library');
        exit();
      }
      return array(array(), 'intro');
      
    case 'logout':
      MendeleyOAuth::logout();
      exit();

    case 'auth':
      try {
        $data = Mendeley::profile('me');
      }
      catch (HTTPException $e){
        if ($_GET['authorise']){     
          MendeleyOAuth::fetch_access_token();
          header('Location: ' . URL . 'auth');
          exit();
        }
      }
      return array($data, 'auth');
      
    case 'importer':
      return array(array(), '../importer/templates/index');
      
    case 'importer-sidebar':
      return array(array(), '../importer/templates/sidebar');
      
    case 'importer-extractors':
      require __DIR__ . '/importer/lib/Importer.php';
      $scripts = Importer::selectScripts($_REQUEST['host']);
			return array(array_filter(array_map(array('Importer', 'loadExtractorScript'), $scripts)));

    case 'api':
      $type = array_shift($request->parts);
      switch ($type){
        case 'profile':
          return array(Mendeley::profile('me'));
          
        case 'folders':
          return array(Mendeley::library_folders(), 'folders');

        case 'groups':
          return array(Mendeley::library_groups());

        case 'catalog':
          $id = array_shift($request->parts);
          if ($id) return array(Mendeley::document($id));
          if (!$_GET['page']) $_GET['page'] = 0;
          if (!$_GET['n']) $_GET['n'] = 20;
          if (!$_GET['q']) throw new HTTPException(404, 'Not Found');
          return array(Mendeley::search('documents', $_GET['q'], $_GET['page'], $_GET['n']), 'documents');
          
        case 'documents':
          $id = array_shift($request->parts);
          switch ($_SERVER['REQUEST_METHOD']){
            case 'GET':
              return get_documents($id, $request);
        
            case 'POST':
              return post_documents($id);

            default:
              header('Allow: GET, POST');
              throw new HTTPException(405);
          }
        break;
        
        case 'pubmed':       
          if (!$_GET['q']) throw new HTTPException(404, 'Not Found');
          return array(PubMed::search($_GET['q'], $_GET['page'], $_GET['n']));
      }
    break;

    case 'appcache':
      header('Content-Type: text/cache-manifest');
      //header('Content-Type: text/plain');
      readfile(__DIR__ . '/static/appcache.txt');
      exit();

    case 'fields':
      $file = __DIR__ . '/static/binary/fields.js';
      header('Content-Type: application/json; charset=utf-8');
      header('Content-Length: ' . filesize($file));
      readfile($file);
      exit();

    default:
      return array(array(), 'index');
  }
}

function get_documents($id, $request){
  if ($id) {
    $section = array_shift($request->parts);
    switch ($section){
      case 'files':
        $filehash = array_shift($request->parts);
        if (!$filehash) throw new HTTPException(403, 'File hash required');
  
        Mendeley::library_readfile($id, $filehash, $_GET['group']);
        exit();

      case '':
        return array(Mendeley::library($id, 'documents'), 'item');

      default:
        throw new HTTPException(404, 'Not Found');
    }
  }

  if ($_GET['folder']) {
    return array(Mendeley::library_folders($_GET['folder']));
  }
  
  if ($_GET['group']) {
    if ($id) return array(Mendeley::library_group_document($_GET['group'], $id));
    return array(Mendeley::library_groups($_GET['group']));
  }

  $data = Mendeley::library(null, null, $_GET['page'], $_GET['n'], $_GET['since']);
  return array($data, 'documents');
}


function post_documents($id){
  if (!$id) {
    $data = (array) Mendeley::library_add_item($_POST);
    if ($data['document_id']){      
      header('Location: http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'] . '/' . $data['document_id'], true, 201);
      exit();
    }
    return $data;
  }

  if ($_POST['folder']){
    $data = Mendeley::set_document_folder($id, $_POST['folder']);
  }
  else if ($_FILES) {
    $file = $_FILES['pdf'];
    
    $headers = array_change_key_case(apache_request_headers(), CASE_LOWER);
    $filename = $headers['x-mendeley-filename'] ? $headers['x-mendeley-filename'] : $file['name'];
    
    $data = Mendeley::library_add_file($id, $file['tmp_name'], $filename, 'application/pdf');

    if ($data['code'] == 201){
      //header('Location: http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'] . '/files/' . $data['id'], true, 201); // FIXME: no file url yet
      header('Location: http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'], true, 201); // FIXME: no file url yet
      exit();
    }

    unlink($file['tmp_name']);
  }
  else {
    $data = Mendeley::library_update_item($id, $_POST);
  }
  return array($data);
}

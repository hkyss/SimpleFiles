<?php
if (empty($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
    return;
}

include_once 'lib/FileList.class.php';
$FileList = new \SimpleFiles\FileList($modx);

switch ($_GET['q']) {
    case 'simplefiles-getfilelist':
      $FileList->GetList();

      echo json_encode(array('status'=>true));
      die();
      break;
    case 'simplefiles-savefilelist':
      $FileList->SaveList($_GET['files'],$_GET['parameters']);

      echo json_encode(array('status'=>true));
      die();
      break;

		default:
      break;
}
?>
<?php namespace SimpleFiles;

class FileList {
  protected $list = array(
    0 => array(
      'id' => 1,
      'text' => 'Assets',
      'children' => array(
        0 => array(
          'id' => 2,
          'text' => 'Documentation and other files',
          'tabs' => array(),
          'children' => array()
        )
      )
    )
  );

  public function __construct($modx,$settings = array())
  {
    $this->evo = $modx;
    $this->settings = $settings;
  }

  public function GetList() {
    $select = $this->evo->db->query('SELECT * FROM '.$this->evo->getFullTableName('sf_files').' ORDER BY sf_id ASC');
    while($row = $this->evo->db->getRow($select)) {
      if(!empty($this->list[0]['children'][0]['paths'][ $row['sf_file'] ])) {
        continue;
      }
      else {
        $this->list[0]['children'][0]['paths'][ $row['sf_file'] ] = $row['sf_file'];
      }

      $index = count($this->list[0]['children'][0]['tabs']);
      $list_item = array(
        'text' => $row['sf_title'].' ('.FileList::FormatSize($row['sf_size']).')',
        'iconCls' => 'fa fa-file-o',
        'attributes' => array(
          'sf_id' => $row['sf_id'],
          'sf_file' => $row['sf_file'],
          'sf_title' => $row['sf_title'],
          'sf_description' => $row['sf_description'],
          'sf_size' => $row['sf_size'],
          'sf_isactive' => $row['sf_isactive'],
          'sf_type' => $row['sf_type'],
          'sf_properties' => $row['sf_properties'],
          'sf_rid' => $row['sf_rid'],
          'sf_index' => $row['sf_index'],
          'sf_createdon' => $row['sf_createdon']
        )
      );

      if(empty($this->list[0]['children'][0]['tabs'][ $row['sf_description'] ])) {
        $this->list[0]['children'][0]['tabs'][ $row['sf_description'] ] = $index;

        $this->list[0]['children'][0]['children'][ $index ] = array(
          'id' => $index,
          'text' => $row['sf_description'],
          'state' => 'closed',
          'children' => array()
        );

        $this->list[0]['children'][0]['children'][ $index ]['children'][] = $list_item;
      }
      else {
        $this->list[0]['children'][0]['children'][ $this->list[0]['children'][0]['tabs'][ $row['sf_description'] ] ]['children'][] = $list_item;
      }
    }

    FileList::Write('assets/plugins/simplefiles/files.json','w');
  }

  public function SaveList($files,$parameters) {
    $files = json_decode($files, true);

    $index = $this->evo->db->getValue(
      $this->evo->db->query('SELECT MAX(sf_index) FROM '.$this->evo->getFullTableName('sf_files'))
    );

    foreach($files as $item_key => $item) {
      $index = $index + 1;
      $files[$item_key]['attributes']['sf_rid'] = $parameters['id'];
      $files[$item_key]['attributes']['sf_index'] = $index;
      $files[$item_key]['attributes']['sf_properties'] = addslashes($files[$item_key]['attributes']['sf_properties']);
      unset($files[$item_key]['attributes']['sf_id']);

      $this->evo->db->insert($files[$item_key]['attributes'], $this->evo->getFullTableName('sf_files'));
    }
  }

  public function Write($filename,$mode) {
    $file = fopen(MODX_BASE_PATH.$filename, $mode);
    fwrite($file, json_encode($this->list));
    fclose($file);
  }

  public function FormatSize($bytes) {
    if ($bytes >= 1073741824) {
      $bytes = number_format($bytes / 1073741824, 2) . ' GB';
    }
    elseif ($bytes >= 1048576) {
      $bytes = number_format($bytes / 1048576, 2) . ' MB';
    }
    elseif ($bytes >= 1024) {
      $bytes = number_format($bytes / 1024, 2) . ' KB';
    }
    elseif ($bytes > 1) {
      $bytes = $bytes . ' B';
    }
    elseif ($bytes == 1) {
      $bytes = $bytes . ' B';
    }
    else {
      $bytes = '0 B';
    }
    return $bytes;
  }
}
?>
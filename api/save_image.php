<?php
$image = $_FILES["image"]["tmp_name"];
$id = $_POST['id'];
if ($image && isset($id)){
  if (filesize($image) < 1024000){
    $pngImage = imagecreatefrompng($image);
    if ($pngImage){
      if (imagepng($pngImage,'tmp/'.$id.'.png')){
        header('Content-Type: application/json');
        echo '{"success":true,"message":"Successfully uploaded file","message_id":"SUCCESS"}';
      }else{
        header('Content-Type: application/json');
        echo '{"success":false,"message":"File could not be saved","message_id":"ERR_NOT_SAVED"}';
      }
    }else{
      header('Content-Type: application/json');
      echo '{"success":false,"message":"File could not be converted as PNG","message_id":"ERR_NOT_PNG"}';
    }
  }else{
    header('Content-Type: application/json');
    echo '{"success":false,"message":"The file is too large","message_id":"ERR_FILE_SIZE"}';
  }
}else{
  header('Content-Type: application/json');
  echo '{"success":false,"message":"Invalid file","message_id":"ERR_INVALID_FILE"}';
}
 ?>

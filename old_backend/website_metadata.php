<?php
$url = $_GET['url'];
$image = imagecreatefrompng($url."/apple-touch-icon.png");
$metadata = get_meta_tags($url);

if ($image){
  header('Content-Type: application/json');
  echo '{"apple_touch_icon_exists":true,"title":"'.getTitle($url).'"}';
}else{
  header('Content-Type: application/json');
  echo '{"apple_touch_icon_exists":false,"title":"'.getTitle($url).'"}';
}

function getTitle($url) {
	$data = file_get_contents($url);
  $title = preg_match('/<title[^>]*>(.*?)<\/title>/ims', $data, $matches) ? $matches[1] : null;
  return $title;
}
?>

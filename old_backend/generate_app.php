<?php
$unique_id = str_replace('.','',str_replace('/','',str_replace('\\','',$_GET['id'])));
$web_link = $_GET["link"];
$name = str_replace("\\","",str_replace("\"","",$_GET["name"]));
$rounded = $_GET["rounded"];
$imgPath = "tmp/".$unique_id.'.png';
$imgFromWebsite = $_GET['siteimg'];

if ($imgFromWebsite == "true"){
  $imgPath = $web_link."/apple-touch-icon.png";
}

$image = imagecreatefrompng($imgPath);
if (!$image){
  $image = imagecreatefromjpeg($imgPath);
}

if (isset($_GET["link"],$_GET["name"])){
  generateApp($unique_id, $web_link, $name, $image, $rounded);
}else{
  deleteTemporaryImage();
  header('Content-Type: application/json');
  echo '{"success":false,"message":"Could not load parameters"}';
}

function generateApp($unique_id,$web_link,$name,$image,$rounded){
  if (!mkdir("../apps/".$unique_id)){
    deleteTemporaryImage();
    header('Content-Type: application/json');
    echo '{"success":false,"message":"Unable to create directory"}';
  }else{
    $index_html = '<!DOCTYPE html>'.
    '<link rel="manifest" href="manifest.webmanifest">'.
    '<link rel="apple-touch-icon" href="apple-touch-icon.png">'.
    '<html>'.
      '<head>'.
        '<meta charset="UTF-8">'.
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />'.
        '<meta name="HandheldFriendly" content="true" />'.
        '<meta name="apple-mobile-web-app-capable" content="yes">'.
        '<meta name="apple-mobile-web-app-status-bar-style" content="default">'.
        '<meta name="theme-color" content="#eeeeee">'.
        '<title>'.$name.'</title>'.
      '</head>'.
      '<body style="background-color:#111115;color:#ffffff;font-family:sans-serif">'.
        '<div style="display:flex;flex-flow:column;height:100vh">'.
          '<div style="flex: 1 0 auto"></div>'.
          '<div style="flex: 1 0 auto;display:flex;">'.
            '<div style="flex: 1 0 auto"></div>'.
            '<div style="flex: 1 0 auto;width: 100%">'.
              '<p style="text-align:center">Once the app is installed, it should redirect automatically.</p>'.
              '<p style="text-align:center;margin:24px">Otherwise, click the link below:</p>'.
              '<a style="width: 128px;padding: 16px;border-radius: 8px;background-color: #2255AA;text-decoration: none;color: #FFFFFF;margin-top:8px;margin-left:calc(50% - 64px)" href="'.$web_link.'">Go to website</a>'.
            '</div>'.
            '<div style="flex: 1 0 auto"></div>'.
          '</div>'.
          '<div style="flex: 1 0 auto"></div>'.
        '</div>'.
        '<script>'.
          'if("serviceWorker" in navigator){'.
            'navigator.serviceWorker.register("worker.js").then(function() {'.
              'console.log("Service Worker Registered"); '.
            '});'.
          '}'.
          'let dp;'.
          'window.addEventListener("beforeinstallprompt", (e) => {'.
            'console.log("should be installable");'.
            'e.preventDefault();dp = e;'.
          '});'.
          'window.addEventListener("appinstalled", (evt) => {'.
            'console.log("INSTALL: Success");'.
          '});'.
          'if (window.matchMedia("(display-mode: standalone)").matches) {'.
            'console.log("Installed");'.
            'window.location.replace("'.$web_link.'");'.
          '}'.
        '</script>'.
      '</body>'.
    '</html>';

    $worker_js =
    'const version = "1";'.
    'const cacheName = `'.$unique_id.'-${version}`;'.
    'self.addEventListener("install", e => {'.
      'e.waitUntil(caches.open(cacheName).then(cache => {'.
        'return cache.addAll([`index.html`,`main-icon.png`,`apple-touch-icon.png`]).then(() => self.skipWaiting());'.
      '}));'.
    '});'.
    'self.addEventListener("activate", event => {'.
      'event.waitUntil(self.clients.claim());'.
    '});'.
    'self.addEventListener("fetch", event => {'.
      'event.respondWith(caches.open(cacheName).then(cache => cache.match(event.request, {ignoreSearch: true})).then(response => {'.
        'return response || fetch(event.request);'.
      '}));'.
    '});';

    $manifest_webmanifest =
    '{'.
      '"short_name": "'.$name.'",'.
      '"name": "'.$name.'",'.
      '"description": "Web app for '.$name.'",'.
      '"icons": ['.
        '{'.
          '"src": "main-icon.png",'.
          '"type": "image/png",'.
          '"sizes": "1024x1024"'.
        '},'.
        '{'.
          '"src": "main-icon-192.png",'.
          '"type": "image/png",'.
          '"sizes": "192x192","purpose": "any maskable"'.
        '},'.
        '{'.
          '"src": "main-icon-512.png",'.
          '"type": "image/png",'.
          '"sizes": "512x512",'.
          '"purpose": "any maskable"'.
        '}'.
      '],'.
      '"start_url": "/apps/'.$unique_id.'/index.html",'.
      '"background_color": "#000000",'.
      '"display": "standalone",'.
      '"scope": "../../apps/'.$unique_id.'/",'.
      '"theme_color": "#222222",'.
      '"shortcuts":[]'.
    '}';

    write("../apps/".$unique_id."/index.html",$index_html);
    write("../apps/".$unique_id."/worker.js",$worker_js);
    write("../apps/".$unique_id."/manifest.webmanifest",$manifest_webmanifest);
    write("../apps/".$unique_id."/name.txt",$name);

    if (!$image){
      $image = imagecreatefrompng("resources/webappify_default.png");
    }

    // example values
    $width = imagesx($image);
    $height = imagesy($image);
    saveResized("../apps/".$unique_id."/apple-touch-icon.png",$image,1024,1024);

    if (intval($rounded) > 0){
      $newImg = imagecreatetruecolor(1024, 1024);
      imagealphablending($newImg, false);
      imagesavealpha($newImg, true);
      imagecopyresized($newImg, $image, 0, 0, 0, 0,1024,1024, $width, $height);
      $newImg = imageCreateCorners($newImg, 190);

      imagealphablending($newImg, false);
      imagesavealpha($newImg, true);

      $image = imagecreatefrompng("resources/rounded_template.png");

      imagecopyresampled($image, $newImg, 98,98, 0, 0, 827, 827,1024,1024);
    }

    saveResized("../apps/".$unique_id."/main-icon.png",$image,1024,1024);
    saveResized("../apps/".$unique_id."/main-icon-512.png",$image,512,512);
    saveResized("../apps/".$unique_id."/main-icon-192.png",$image,192,192);

    $newLink = 'https://webappify.noahsadir.io/apps/'.$unique_id;
    deleteTemporaryImage();
    header('Content-Type: application/json');
    echo '{"success":true,"link":"'.$newLink.'"}';
    //echo '<div id="success"><p id="success_title">Success!</p><p>Click on the link below or copy & paste it into your browser.</p><a id="success_link" href="'.$newLink.'">'.$newLink.'</a></div>';
    //echo '<a href="https://investalyze.app/webappify/apps/'.$unique_id.'/index.html">Go to website</a>';

  }
}

function imageCreateCorners($src, $radius) {
  $w = imagesx($src);
  $h = imagesy($src);
  # create corners
  $q = 1;

  # find unique color
  do {
    $r = rand(0, 255);
    $g = rand(0, 255);
    $b = rand(0, 255);
  }
  while (imagecolorexact($src, $r, $g, $b) < 0);

  $nw = $w*$q;
  $nh = $h*$q;

  $img = imagecreatetruecolor($nw, $nh);
  $alphacolor = imagecolorallocatealpha($img, $r, $g, $b, 127);
  imagealphablending($img, false);
  imagesavealpha($img, true);
  imagefilledrectangle($img, 0, 0, $nw, $nh, $alphacolor);

  imagefill($img, 0, 0, $alphacolor);
  imagecopyresampled($img, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);

  imagearc($img, $radius-1, $radius-1, $radius*2, $radius*2, 180, 270, $alphacolor);
  imagefilltoborder($img, 0, 0, $alphacolor, $alphacolor);
  imagearc($img, $nw-$radius, $radius-1, $radius*2, $radius*2, 270, 0, $alphacolor);
  imagefilltoborder($img, $nw-1, 0, $alphacolor, $alphacolor);
  imagearc($img, $radius-1, $nh-$radius, $radius*2, $radius*2, 90, 180, $alphacolor);
  imagefilltoborder($img, 0, $nh-1, $alphacolor, $alphacolor);
  imagearc($img, $nw-$radius, $nh-$radius, $radius*2, $radius*2, 0, 90, $alphacolor);
  imagefilltoborder($img, $nw-1, $nh-1, $alphacolor, $alphacolor);
  imagealphablending($img, true);
  imagecolortransparent($img, $alphacolor);

  # resize image down
  $dest = imagecreatetruecolor($w, $h);
  imagealphablending($dest, false);
  imagesavealpha($dest, true);
  imagefilledrectangle($dest, 0, 0, $w, $h, $alphacolor);
  imagecopyresampled($dest, $img, 0, 0, 0, 0, $w, $h, $nw, $nh);

  # output image
  $res = $dest;
  imagedestroy($src);
  imagedestroy($img);

  return $res;
}

//Delete image saved by save_image.php
function deleteTemporaryImage(){
  if (file_exists('tmp/'.$unique_id.'.png')){
    unlink('tmp/'.$unique_id.'.png');
  }
}

function saveResized($path,$image,$width,$height){
  $newImg = imagecreatetruecolor($width, $height);
  imagealphablending($newImg, false);
  imagesavealpha($newImg, true);
  imagecopyresized($newImg, $image, 0, 0, 0, 0, $width, $height, imagesx($image), imagesy($image));
  imagepng($newImg,$path);
}

function write($path,$txt){
  $myfile = fopen($path, "w") or die("Unable to open file!");
  fwrite($myfile, $txt);
  fclose($myfile);
}

 ?>
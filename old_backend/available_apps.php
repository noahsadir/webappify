<?php
$appList = scandir('../apps/');
$output = '[';
foreach ($appList as $appDir){
  if ($appDir != "." && $appDir != ".."){
    $appName = str_replace("\\","",str_replace("\"","",file_get_contents('../apps/'.$appDir.'/name.txt')));
    if ($appName == ""){
      $appName = "[Unnamed]";
    }
    $output = $output.'{"id":"'.$appDir.'","name":"'.$appName.'"},';
  }
}
if (substr($output,-1) == ","){
  $output = substr($output, 0, -1);
}
$output = $output.']';
header('Content-Type: application/json');
echo $output;
 ?>

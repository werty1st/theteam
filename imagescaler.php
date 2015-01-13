<?php   

// $url="img/faces/pernille.jpg";
// $w=80;
// $h=80;
// $scaleAfter="crop";
// $server="localhost";

$url = $_GET["file"];
$w = $_GET["w"];
$h = $_GET["h"];

	$source_image = imagecreatefromjpeg($url);
	$source_imagex = imagesx($source_image);
	$source_imagey = imagesy($source_image);

	$dest_imagex = $w;
	$dest_imagey = $h;
	$dest_image = imagecreatetruecolor($dest_imagex, $dest_imagey);

	imagecopyresampled($dest_image, $source_image, 0, 0, 0, 0, $dest_imagex, 
				$dest_imagey, $source_imagex, $source_imagey);

	header("Content-Type: image/jpeg");
	imagejpeg($dest_image,NULL,80);
?>
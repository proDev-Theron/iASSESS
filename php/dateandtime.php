<?php
if (isset($_GET['timezone'])) {
  $timezone = new DateTimeZone($_GET['timezone']);
} else {
  $timezone = new DateTimeZone("Asia/Manila");
}
$date = new DateTime();
$date->setTimezone($timezone);
$dateAndTime = array("currentDate"=>$date->format('d F Y H:i:s'));
echo $_GET['callback'] . '(' . json_encode($dateAndTime) . ')';
?>


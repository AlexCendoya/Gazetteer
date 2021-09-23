<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url='https://api.openweathermap.org/data/2.5/weather?q=' . $_REQUEST['capitalCity'] . '&units=metric&appid=85d38f64c17227dd8dccf75af3501327';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    $decode = json_decode($result,true);	

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data1'] = $decode['main'];
    $output['data2'] = $decode['weather'];
    $output['data3'] = $decode['coord'];

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

?>
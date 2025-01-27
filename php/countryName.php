<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url='https://restcountries.com/v3/alpha/' . $_REQUEST['isoCode'];
    
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
    $output['data1'] = $decode[0]['name'];
    $output['data2'] = $decode[0]['capital'][0];
    $output['data3'] = $decode[0]['flags'][1];

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

?>

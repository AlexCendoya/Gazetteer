<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url='https://restcountries.com/v2/alpha/' . $_REQUEST['isoCode'];
    
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
    $output['data1'] = $decode['name'];
    $output['data2'] = $decode['capital'];
    $output['data3'] = $decode['population'];
    $output['data4'] = $decode['currencies'];
    $output['data5'] = $decode['languages'];
    $output['data6'] = $decode['callingCodes'];

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

?>

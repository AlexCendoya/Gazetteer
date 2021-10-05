<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url='https://holidays.abstractapi.com/v1/?api_key=4276cc3a91224b4e884499b930afc8e0&country=' . $_REQUEST['isoCode'] . '&year=' . $_REQUEST['year'] . '&month=' . $_REQUEST['month'] . '&day=' . $_REQUEST['day'];

    
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
    $output['data2'] = $decode[0]['type'];

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

?>

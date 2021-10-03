<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url='https://www.triposo.com/api/20210615/poi.json?tag_labels=history&location_id=' . $_REQUEST['tidiedCountry'] . '&count=10&order_by=-score&fields=name,best_for,coordinates,images,snippet,score,id&account=Z1SBIW0E&token=w07hdb8uk0w75rhs4drefdvijxpbtwg0';

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
    $output['data'] = $decode['results'];


    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

?>
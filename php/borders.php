
<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $isoCode = $_GET['isoCode'];

    $result= file_get_contents('countryborders.geo.json');

    $decode = json_decode($result,true);

    $borders = [];


    foreach($decode["features"] as $feature ) {
        
        if ($isoCode == $feature["properties"]["iso_a2"]) {
            
            $borders = $feature["geometry"];

            break;
        }


    };


    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $borders;


    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

?>
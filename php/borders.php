<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $isoCode = $_POST['isoCode'];

    $result= file_get_contents('countryBorders.geo.json');

    $decode = json_decode($result,true);

    //Iterate through the geoJson file to retrieve the data

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
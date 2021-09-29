<?php

	//enable error reporting - change to Off to disable
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    //store start time for accessing this file
    $executionStartTime = microtime(true);

    //capture the contents of the following file
    $result= file_get_contents('countryBorders.geo.json');

    //assume it's json data and decode
    $decode = json_decode($result,true);

    //Iterate through the geoJson file to retrieve the data

    $newArr = [];

    for ($i=0; $i < count($decode["features"]); $i++) { 
		
        array_push($newArr, $decode["features"][$i]["properties"]);

    }

	//set up output array to send back to JS
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $newArr;

    header('Content-Type: application/json; charset=UTF-8');

    //print the contents on the screen
    echo json_encode($output); 

?>





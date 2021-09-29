<?php

	//enable error reporting - change to Off to disable
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    //store start time for accessing this file
    $executionStartTime = microtime(true);

    //call site to retrieve information via API
    $url='http://api.geonames.org/countryCodeJSON?formatted=true&lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=alexcendoya&style=full';

    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    //assume it's json data and decode
    $decode = json_decode($result,true);	

	//set up output array to send back to JS
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode['countryCode'];

    header('Content-Type: application/json; charset=UTF-8');

    //print the contents on the screen
    echo json_encode($output); 

?>

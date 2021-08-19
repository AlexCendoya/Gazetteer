/*


// map and markers



        
    var lat, lng

    function success(position) {

        lat  = position.coords.latitude;
        lng = position.coords.longitude;

        document.getElementById('lat').textContent = lat
        document.getElementById('lng').textContent = lng


        setInterval(showModal, 60000);
        function showModal() {
            $('#mymodal').modal('show');
        }


        var marker, popup, circle;

        function getPosition(position) {

            if(marker) {
                map.removeLayer(marker)
            }

            if(circle) {
                map.removeLayer(circle)
            }

            marker = L.marker([lat, lng]);

            popup = marker.bindPopup('You are here!').openPopup()
            popup.addTo(mymap);

            circle = L.circle([lat, lng], {
                color: 'red', 
                fillColor: '#f03', 
                fillOpacity: 0.25
            });

            var featureGroup = L.featureGroup([marker, circle]).addTo(mymap);

            map.fitBounds(featureGroup.getBounds());
        }

        //AJAX calls by geolocation



        $.ajax({
            url: "php/findNearbyPlaceName.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: $('#lat').val(),
                lng: $('#lng').val()
            },
            success: function(result) {

                console.log(JSON.stringify(result));

                if (result.status.name == "ok") {

                    $('#cityName').html(result['data'][0]['name']);
                    $('#countryName').html(result['data'][0]['countryName']);

                }
                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
            }
        }); 


        $.ajax({
            url: "php/weather.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: $('#lat').val(),
                lng: $('#lng').val()
            },
            success: function(result) {

                console.log(JSON.stringify(result));

                if (result.status.name == "ok") {

                    $('#weather').html(result['data'][0]['description']);

                }
                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
            }
        }); 


        $.ajax({
            url: "php/exchangeRate.php",
            type: 'POST',
            dataType: 'json',

            success: function(result) {

                console.log(JSON.stringify(result));

                if (result.status.name == "ok") {

                    $('#exchangeRate').html(result['data'][0]['BMD']);

                }

                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
            }
        }); 



        $.ajax({
            url: "php/findNearbyWikipedia.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: $('#lat').val(),
                lng: $('#lng').val()
            },
            success: function(result) {

                console.log(JSON.stringify(result));

                if (result.status.name == "ok") {

                    $('#summary').html(result['data'][0]['summary']);

                }
                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
            }
        }); 



        //End of AJAX calls by geolocation


        //Dropdown menu


        $.ajax({
            url: "php/Navbar.php",
            type: 'POST',
            dataType: "json",       
            success: function(result) {
                console.log(result);
        
                if (result.status.name == "ok") {
        
                    $('#selectCountry').append($('<option>', result['data'][0]['properties'] {
                        value: result.data.border.features.properties.iso_a2,
                        text: result.data.border.features.properties.name,
                    });
        
        
                }        
        
                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
            }
            
        });
        


    }  
        
    function error(err) {
        alert('Sorry, no position available.');
    }
        
    const options = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 60000
    };

    if (!navigator.geolocation) {

    console.log("Your browser doesn't support geolocation feature!"); 

    } else {
        navigator.geolocation.watchPosition(success, error, options);
    }


    

    





        //AJAX calls to countryBorders files





var border;

$('#selectBtn').click(function() {

    let name = $('#selCountry').val();
    
    $.ajax({
        url: "php/borders.php",
        type: 'POST',
        dataType: 'json',
        success: function(result) {
            console.log(result);

            if (result.status.name == "ok") {

                $('#mapid').addTo(mymap, (result['data'][0]['geometry'] {
                    
                    if (name === "CA") {
                        border = L.geoJSON(result.data.border.features[1]);
                        } else if (name === "BS") {
                        border = L.geoJSON(result.data.border.features[0]);
                        }
                    const filterData = result.data.border.features.filter((a) => (a.properties.iso_a2 === name));
                    border = L.geoJSON(filterData[0]);

                });
            
                map.fitBounds(border.getBounds());
            } 

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }

    }); 



});





    //AJAX via Navbar





$('#selectBtn').click(function() {


    $.ajax({
        url: "php/findNearbyPlaceName.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#lat').val(),
            lng: $('#lng').val()
        },
        success: function(result) {
    
            console.log(JSON.stringify(result));
    
            if (result.status.name == "ok") {
    
                $('#cityName').html(result['data'][0]['name']);
                $('#countryName').html(result['data'][0]['countryName']);
    
            }
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    }); 
    
    $.ajax({
        url: "php/weather.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#lat').val(),
            lng: $('#lng').val()
        },
        success: function(result) {
    
            console.log(JSON.stringify(result));
    
            if (result.status.name == "ok") {
    
                $('#weather').html(result['data'][0]['description']);
    
            }
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    }); 
    
    
    $.ajax({
        url: "php/exchangeRate.php",
        type: 'POST',
        dataType: 'json',
    
        success: function(result) {
    
            console.log(JSON.stringify(result));
    
            if (result.status.name == "ok") {
    
                $('#exchangeRate').html(result['data'][0]['BMD']);
    
            }
    
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
             console.log(jqXHR);
        }
    }); 
    
    
    
    $.ajax({
        url: "php/findNearbyWikipedia.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#lat').val(),
            lng: $('#lng').val()
        },
        success: function(result) {
    
            console.log(JSON.stringify(result));
    
            if (result.status.name == "ok") {
    
                $('#summary').html(result['data'][0]['summary']);
    
            }
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    }); 

});

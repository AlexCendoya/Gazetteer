$(document).ready(function(){


    //Sidebar

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    //map and geolocation


    var mymap = L.map('mapid').setView([47, 2], 3);

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(mymap);

    if(!navigator.geolocation) {
        console.log("Your browser doesn't support geolocation")
    } else {
        navigator.geolocation.getCurrentPosition(getPosition)
    }


    // latitude&longitude values, marker and pop-up

    var lat, lng, marker, border, borderStyle, borderLines

    function getPosition(position) {
        lat = position.coords.latitude
        lng = position.coords.longitude
        var accuracy = position.coords.accuracy

        let coords = [lat, lng];

        marker = L.marker(coords).addTo(mymap).bindPopup("<h5>You are here!</h5>").openPopup();

        
        //geolocation out of lat/lng: get ISO code out API and use it highlight location
        

        $.ajax({
            url: "php/countryCode.php",
            type: 'POST',
            dataType: "json", 
            data: {
                lat: lat,
                lng: lng,
            }, 
            success: function(result) {
                
                console.log(result);

                if (result.status.name == "ok") {

                    $("#selectCountry").val(result['data'].toUpperCase()).change();

                    // modal and modal content

                    $("#exampleModal").modal('show');

                    $.ajax({

                        url: "php/cityName.php",

                        type: 'POST',

                        dataType: "json",

                        data: {
                            lat: lat,
                            lng: lng,
                        },   

                        success: function(r1) {

                            console.log(r1);

                            if (r1.status.name == "ok") {
                           

                                $('#cityName').html(r1.data.suburb + "(" + r1.data.city + ")");

                                var cityName = r1.data.city;

                                console.log(r1.data.city);

 

                                $.ajax({

                                    url: "php/wikipedia.php",
                                    type: 'POST',
                                    dataType: "json",
                                    data: {cityName: encodeURI(r1.data.city)},   

                                    success: function(result1) {
            
                                        console.log(result1);
            
                                        if (result1.status.name == "ok") {
                                            
                                            var cityWikipedia = result1['data'][0]['wikipediaUrl'];
           
                                            $('#wikipedia').html('<a href ="' + cityWikipedia + '"> ' + cityName + ' </a>');
            
                                        }

          
                                    },

                                    error: function(jqXHR, textStatus, errorThrown) {

                                        console.log(jqXHR);

                                    }
                                        
        

                                }); 

 

                            }

 

                        },

                        error: function(jqXHR, textStatus, errorThrown) {

                            console.log(jqXHR);

                        }

                        

 

                    });


                    $.ajax({
                        url: "php/weather.php",
                        type: 'POST',
                        dataType: "json",
                        data: {
                            lat: lat,
                            lng: lng,
                        },   
                        success: function(result) {

                            console.log(result);

                            if (result.status.name == "ok") {
                                
                                $('#temperature').html(result.data1.temp + "°C");
                                $('#humidity').html(result.data1.humidity + "%");                                
                                $('#weather').html(result['data2'][0]['description']);

                                var weatherIcon = result['data2'][0]['icon'];

                                $('#weatherIcon').html("<img src='http://openweathermap.org/img/wn/" + weatherIcon + "@2x.png' />");

                            }

                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR);
                        }
                        

                    });
                    

                    $.ajax({
                        url: "php/time.php",
                        type: 'POST',
                        dataType: "json",
                        data: {
                            lat: lat,
                            lng: lng,
                        },   
                        success: function(result) {

                            console.log(result);

                            if (result.status.name == "ok") {
                                
                                $('#sunrise').html(result['data1']);
                                $('#sunset').html(result['data2']);
                                $('#time').html(result['data3']);

                            }

                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR);
                        }

                       

                    }); 


                    $.ajax({
                        url: "php/findNearbyWikipedia.php",
                        type: 'POST',
                        dataType: "json",
                        data: {
                            lat: lat,
                            lng: lng,
                        },   
                        success: function(result) {

                            console.log(result);

                            if (result.status.name == "ok") {
                                
                                var nearbyWikipedia = result['data'][0]['wikipediaUrl'];

                                $('#nearbyWikipedia').html('<a href ="' + nearbyWikipedia + '">Something interesting next to you awaits to be found</a>');

                            }

                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR);
                        }

                       

                    });


                }     
                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
            }
            
        });

                    

    }  


    /* Dropdown menu*/


    $.ajax({
        url: "php/navbar.php",
        type: 'POST',
        dataType: "json", 
        data: 'data',     
        success: function(result) {

            console.log(result);

            if (result.status.name == "ok") {

                $.each(result['data'], function (i, val) {

                    $('#selectCountry').append(`<option value="${val['properties']['iso_a2']}">${val['properties']['name']}</option>`);
                 
                });

            }     
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
        
    });



    /* Borders */


    $('#selectCountry').change(function() {

        let isoCode = $('#selectCountry').val();

        $.ajax({
            url: "php/borders.php",
            type: 'POST',
            dataType: "json",
            data: {"isoCode": isoCode},  
            success: function(result) {

                console.log(result);

                if (result.status.name == "ok") {

                    if (mymap.hasLayer(border)) {
                        mymap.removeLayer(border);
                    }

                    borderLines = result["data"];

                    borderStyle = {
                        "color": "#ff0000",     
                        "weight": 10,
                        "opacity": 0.5
                    };

                    border = L.geoJSON(borderLines, {
                        style : borderStyle
                    }).addTo(mymap);               
                
                    mymap.fitBounds(border.getBounds());

                     
                    
                    // sidebar content

                    $('#countryFlag').html("<img src='https://www.countryflags.io/" + isoCode + "/flat/64.png' />");


                    $.ajax({
                        url: "php/restCountries.php",
                        type: 'POST',
                        dataType: "json",
                        data: {"isoCode": isoCode},  
                        success: function(result) {

                            console.log(result);

                            if (result.status.name == "ok") {

                                $('#countryName').html(result['data1']);
                                $('#capitalCity').html(result['data2']);
                                $('#population').html(result['data3']);
                                $('#currencyName').html(result['data4'][0]['name']);
                                $('#currencySymbol').html(result['data4'][0]['symbol']);
                                $('#language').html(result['data5'][0]['name']);


                            }

                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR);
                        }
                    });



                }

            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
            }


        });

    });


});


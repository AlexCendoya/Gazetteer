$(document).ready(function(){

    //Loader - to be checked
    
    $(window).on("load", function() {
        $('#preloader').fadeOut('slow', function() {
            $(this).remove();
        });
    });
    

    //map and geolocation

    var mymap = L.map('mapid').setView([47, 2], 3);

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(mymap);

    var infoButton = L.easyButton('<i class="fas fa-globe-europe fa-lg"></i>', function(btn, mymap) {
        $('#myModal').modal('show');
    }, {position: 'bottomright'}).addTo(mymap);

    if(!navigator.geolocation) {
        console.log("Your browser doesn't support geolocation")
    } else {
        navigator.geolocation.getCurrentPosition(getPosition)
    }

    // latitude&longitude values

    var lat, lng, border

    function getPosition(position) {
        lat = position.coords.latitude
        lng = position.coords.longitude
        var accuracy = position.coords.accuracy

        let coords = [lat, lng];

        
        //geolocation out of lat/lng: get ISO code out API and use it highlight location
        
        var marker, suburb, cityName, localTime, localTemperature, localWeather, localHumidity, localWeatherIcon, cityWikipedia

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


                    //modal and pop-up content

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

                                suburb = r1.data.suburb

                                cityName = r1.data.city;

                                console.log(r1.data.city);

                                // popup marker

                                marker = L.marker(coords).addTo(mymap).bindPopup(
                                    "<h5 align='center'>You are here!</h5><h6>" + suburb + " (" + cityName + ")</h6><hr/><table><tr><td><img src='http://openweathermap.org/img/wn/" 
                                    + localWeatherIcon 
                                    + "@2x.png' /></td><td>" 
                                    + localTemperature + "°C </td></tr></table>"
                                    + localWeather + ", " + localHumidity + "% humidity <br/>" 
                                    + localTime + "<br/>" 
                                    + "<a href =https://" + cityWikipedia + ">" + cityName + "</a>"
                                ).openPopup();

                                $.ajax({

                                    url: "php/wikipedia.php",
                                    type: 'POST',
                                    dataType: "json",
                                    data: {cityName: encodeURI(r1.data.city)},   

                                    success: function(result1) {
            
                                        console.log(result1);
            
                                        if (result1.status.name == "ok") {
                                            
                                            cityWikipedia = result1['data'][0]['wikipediaUrl'];
           
                                            $('#wikipedia').html("<a href =https://" + cityWikipedia + ">" + cityName + "</a>");

            
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
                        url: "php/localWeather.php",
                        type: 'POST',
                        dataType: "json",
                        data: {
                            lat: lat,
                            lng: lng,
                        },   
                        success: function(result) {

                            console.log(result);

                            if (result.status.name == "ok") {

                                localTemperature = result.data1.temp;
                                localHumidity = result.data1.humidity;
                                localWeather = result['data2'][0]['description'];
                                localWeatherIcon = result['data2'][0]['icon'];

                            }

                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR);
                        }
                        

                    });
                    

                    $.ajax({
                        url: "php/localTime.php",
                        type: 'POST',
                        dataType: "json",
                        data: {
                            lat: lat,
                            lng: lng,
                        },   
                        success: function(result) {

                            console.log(result);

                            if (result.status.name == "ok") {
                                
                                localTime = result['data'];


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

    var capitalCity

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

                    var borderLines = result["data"];

                    var borderStyle = {
                        "color": "#ff0000",     
                        "weight": 10,
                        "opacity": 0.5
                    };

                    border = L.geoJSON(borderLines, {
                        style : borderStyle
                    }).addTo(mymap); 
                    
                
                    mymap.fitBounds(border.getBounds());

                    // modal show

                    $("#myModal").modal('show');
                    
                    // modal content

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
                                $('#callingCode').html("+" + result['data6']);

                                capitalCity = result['data2'];
                                
                                // capital city temperature, humidity, weather, weather icon and coordinates, in order to retrieve local time

                                $.ajax({
                                    url: "php/countryWeather.php",
                                    type: 'POST',
                                    dataType: "json",
                                    data: {"capitalCity": capitalCity},
                                    success: function(result) {
            
                                        console.log(result);
            
                                        if (result.status.name == "ok") {
                                            
                                            $('#countryTemperature').html(result.data1.temp + "°C");
                                            $('#countryHumidity').html(result.data1.humidity + "%");
                                            $('#countryWeather').html(result['data2'][0]['description']);

                                            var countryWeatherIcon = result['data2'][0]['icon'];
            
                                            $('#countryWeatherIcon').html("<img src='http://openweathermap.org/img/wn/" + countryWeatherIcon + "@2x.png' />");

                                            //reassing the lat, lng values to capital city in order to get a nationally representative response

                                            let lat = result.data3.lat;
                                            let lng = result.data3.lon;


                                            $.ajax({
                                                url: "php/localTime.php",
                                                type: 'POST',
                                                dataType: "json",
                                                data: {
                                                    lat: lat,
                                                    lng: lng,
                                                }, 
                                                success: function(result) {
                                                    
                                                    console.log(result);  

                                                    if (result.status.name == "ok") {

                                                        $('#countryTime').html(result['data']);

                                                    }
                                                },
                                                error: function(jqXHR, textStatus, errorThrown) {
                                                    console.log(jqXHR);
                                                }
                                            });

                                            //marker cluster - in process

                                            $.ajax({
                                                url: "php/cluster.php",
                                                type: 'POST',
                                                dataType: "json",
                                                data: {
                                                    lat: lat,
                                                    lng: lng,
                                                }, 
                                                success: function(result) {
                                                    
                                                    console.log(result);  

                                                    if (result.status.name == "ok") {

                                                        var addressPoints = result['data'];

                                                        var markers = L.markerClusterGroup();

                                                        for (var i = 0; i < addressPoints.length; i++) {
                                                            var a = addressPoints[i];
                                                            let marker = L.marker(new L.LatLng(a[0], a[1]), {
                                                                title: title
                                                            });
                                                            marker.bindPopup(title);
                                                            markers.addLayer(marker);
                                                        }

                                                        mymap.addLayer(markers);

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

                                    url: "php/capitalWikipedia.php",
                                    type: 'POST',
                                    dataType: "json",
                                    data: {"capitalCity": capitalCity},   

                                    success: function(result1) {
            
                                        console.log(result1);
            
                                        if (result1.status.name == "ok") {
                                            
                                            var capitalCityWikipedia = result1['data'][0]['wikipediaUrl'];
           
                                            $('#capitalWikipedia').html("<a href =https://" + capitalCityWikipedia + ">" + capitalCity + "</a>");
            
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

            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
            }


        });

    });


});


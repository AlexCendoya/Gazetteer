//map and geolocation


var mymap = L.map('mapid').setView([47, 2], 3);


/*
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
maxZoom: 18,
id: 'mapbox/streets-v11',
tileSize: 512,
zoomOffset: -1,
accessToken: 'pk.eyJ1IjoiYWxleGNlbmRveWEiLCJhIjoiY2tycXU2b2I3MHFydzJ2cGZ5anY4NHJpMSJ9.XuEs1wZwgCGeCNoG5y4lpQ'
}).addTo(mymap);
*/

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(mymap);

if(!navigator.geolocation) {
    console.log("Your browser doesn't support geolocation")
} else {
    navigator.geolocation.getCurrentPosition(getPosition)
}


// latitude&Longitude values and marker

var lat, lng, countryCode, border, borderStyle, borderLines

function getPosition(position) {
    lat = position.coords.latitude
    lng = position.coords.longitude
    var accuracy = position.coords.accuracy

    let coords = [lat, lng];

    var marker = L.marker(coords).addTo(mymap).bindPopup("<h4>You are here!</h4>").openPopup();

    
    //geolocation out of lat/lng: get ISO code out API and use for AJAX call  
    

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

                countryCode = result["data"];
                /*
                $.ajax({
                    url: "php/borders.php",
                    type: 'POST',
                    dataType: "json",
                    data: {"countryCode": countryCode},
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

                            border = L.geoJSON(borderLines , {
                                style : borderStyle

                            }).addTo(mymap);               
                
                            mymap.fitBounds(border.getBounds());

                        }

                    }
                    error: function(jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    }

                });
                */
            }     
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
        
    });


}  


/*
watchPosition

var lat, lng

function success(position) {
    
    var crd = position.coords

    lat = position.coords.latitude
    lng = position.coords.longitude
    var accuracy = position.coords.accuracy

    var marker = L.marker([lat, lng]).addTo(mymap);

}

function error(err) {

console.warn('ERROR(' + err.code + '): ' + err.message);

}

var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

var watchIid = navigator.geolocation.watchPosition(success, error, options);
*/


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

                var borderLines = result["data"];

                var borderStyle = {
                    "color": "#ff0000",     
                    "weight": 10,
                    "opacity": 0.5
                };

                border = L.geoJSON(borderLines , {
                    style : borderStyle

                }).addTo(mymap);               
            
                mymap.fitBounds(border.getBounds());

                /* pop-up, not definite location*/

                /*
                $(document).ready(function(){
                    $("exampleModal").modal('show');
                });
                */

            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }


    });

});




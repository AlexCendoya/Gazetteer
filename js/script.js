// map and markers

var mymap = L.map('mapid').setView([50, 0], 5);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
maxZoom: 18,
id: 'mapbox/streets-v11',
tileSize: 512,
zoomOffset: -1,
accessToken: 'pk.eyJ1IjoiYWxleGNlbmRveWEiLCJhIjoiY2tycXU2b2I3MHFydzJ2cGZ5anY4NHJpMSJ9.XuEs1wZwgCGeCNoG5y4lpQ'
}).addTo(mymap);

if (!navigator.geolocation) {
   console.log("Your browser doesn't support geolocation feature!")  
} else {
    setInterval(() => {
    navigator.geolocation.getCurrentPosition(getPosition)
    }, 60000);

    setInterval(showModal, 60000);
    function showModal() {
        $('#mymodal').modal('show');
    }
    
}


var marker, popup, circle;

function getPosition(position){
 
    var lat = position.coords.latitude
    var lng = position.coords.longitude
    var accuracy = position.coords.accuracy
    document.getElementById('lat').textContent = lat
    document.getElementById('lng').textContent = lng

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
        radius: accuracy, 
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

        //AJAX calls to countryBorders files

$.ajax({
    url: "php/Navbar.php",
    type: 'POST',
    dataType: "json",       
    success: function(result) {
        console.log(result);
                    
        for (var i=0; i<result.data.border.features.length; i++) {
            $('#selectCountry').append($('<option>', {
                value: result.data.border.features[i].properties.iso_a2,
                text: result.data.border.features[i].properties.name,
            }));
        }
        }
    });




var border;

$('#selectBtn').click(function() {

    $.ajax({
        url: "php/borders.php",
        type: 'POST',
        dataType: 'json',
        success: function(result) {
    
            

    }); 


    map.fitBounds(border.getBounds());
});




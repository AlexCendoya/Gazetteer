// marker

var lat, lng

function getPosition(position) {
    lat = position.coords.latitude
    lng = position.coords.longitude
    var accuracy = position.coords.accuracy

    const coords = [lat, lng];

    var marker = L.marker(coords).addTo(mymap).bindPopup("<h4>You are here!</h4>").openPopup();

    
}


/* watchPosition

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

$('#selectBtn').click(function() {
    
    $.ajax({
        url: "php/findNearbyWikipedia.php",
        type: 'POST',
        dataType: 'json',
        data: {lat, lng},
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



/* Dropdown menu*/


$.ajax({
    url: "php/Navbar.php",
    type: 'POST',
    dataType: "json", 
    data: 'data',     
    success: function(result) {

        console.log(result);

        if (result.status.name == "ok") {

            $.each(result['data'], function (i, val) {

                $('#selectCountry').append(`<option value="${val['properties']['iso_a2']}">${val['properties']['name']}</option>`)

            });

        }     
        
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
    }
    
});


    /* Borders */


var border ;

$('#selectBtn').click(function() {

    let code = $('#selectCountry').val();

    $.ajax({
        url: "php/borders.php",
        type: 'POST',
        dataType: "json", 
        success: function(result) {

            console.log(result);

            if (result.status.name == "ok") {

                if (map.hasLayer(border)) {
                    map.removeLayer(border);
                }
               
                $.each(result['data'], function (i, val) {

                    if (code === result.data.features[i].properties.iso_a2) {

                        border = L.geoJSON(result.data.features[i].geometry.coordinates, {
                            color: "#ff0000",
                            weight: 10,
                            opacity: 0.5
                        }).addTo(mymap).setView(coords, 10);

                    }

                });

                map.fitBounds(border.getBounds());

            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }

    });
});
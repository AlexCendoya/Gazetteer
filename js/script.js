
if(!navigator.geolocation) {
    console.log("Your browser doesn't support geolocation")
} else {
    navigator.geolocation.getCurrentPosition(getPosition)
}


var lat, lng

function getPosition(position) {
    lat = position.coords.latitude
    lng = position.coords.longitude
    var accuracy = position.coords.accuracy

    var marker = L.marker([lat, lng]).addTo(mymap);
}

/*

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


/* Navbar

const selectElement = document.querySelector('.ice-cream');

selectElement.addEventListener('change', (event) => {
  const result = document.querySelector('.result');
  result.textContent = `You like ${event.target.value}`;
});

*/
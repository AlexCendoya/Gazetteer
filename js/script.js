


function success(position) {
    
    var crd = position.coords

    var lat = position.coords.latitude
    var lng = position.coords.longitude
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



function initAutocomplete() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var temple = {
        lat: 39.9808,
        lng: -75.1496
    }
    var map = new google.maps.Map(document.getElementById('map'), {
        center: temple,
        zoom: 13,
        mapTypeId: 'roadmap'
    });

    directionsDisplay.setMap(map);

    // Create the search box and link it to the UI element.
    var input = document.getElementById('endLoc');
    var endLoc = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the endLoc results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        endLoc.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    endLoc.addListener('places_changed', function () {
        var places = endLoc.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });

        var myRoute = {
            origin: temple,
            destination: markers[0].position,
            travelMode: 'WALKING'
        }

        directionsService.route(myRoute, function (response, status) {
            if (status == 'OK') {
                directionsDisplay.setDirections(response);
                post('127.0.0.1:3000/insertRoute', {
                    startLoc: JSON.stringify(myRoute.origin),
                    endLoc: JSON.stringify(myRoute.destination)
                });
                console.log(JSON.stringify(myRoute.origin) + " to " + JSON.stringify(myRoute.destination));
            };
        });

        map.fitBounds(bounds);
    });

}

function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
};
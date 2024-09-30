let prevUserPos;

function haversine_distance(mk1, mk2) {
  let R = 3958.8; // Radius of the Earth in miles
  let rlat1 = mk1.lat * (Math.PI/180); // Convert degrees to radians
  let rlat2 = mk2.lat * (Math.PI/180); // Convert degrees to radians
  let difflat = rlat2-rlat1; // Radian difference (latitudes)
  let difflon = (mk2.lng-mk1.lng) * (Math.PI/180); // Radian difference (longitudes)

  let d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  return d;
}

function handleLocationError(
  browserHasGeolocation,
  infoWindow,
  pos,
  error
) {
  let errorMessage = browserHasGeolocation
    ? "Error: The Geolocation service failed."
    : "Error: Your browser doesn't support geolocation.";

  if (error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "User denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        errorMessage = "An unknown error occurred.";
        break;
    }
  }

  displayError(errorMessage);
}

async function startTracking() {
  if (navigator.geolocation) {
    // Watch the user's position continuously
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        prevUserPos = userPos;
        userPos = pos;
        // Update the user marker's position
        userMarker.setPosition(pos);

        if (!centeredOnce) {
          reCenter();
          centeredOnce = true;
        }

        // Update the accuracy circle
        accuracyCircle.setCenter(pos);
        accuracyCircle.setRadius(position.coords.accuracy);

        // Fetch restaurants as needed
        let locationUpdate = !prevUserPos || haversine_distance(prevUserPos, userPos) >= 0.01;
        if (locationUpdate && !input.value) {
            showLoading();
            fetchNearbyRestaurants(pos);
        }

      },
      (error) => {
        handleLocationError(true, infoWindow, map.getCenter(), error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter(), null);
  }
}
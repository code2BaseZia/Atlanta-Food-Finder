let prevUserPos;

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
        let locationUpdate = prevUserPos && (userPos.lat - prevUserPos.lat !== 0) && (userPos.lng - prevUserPos.lng !== 0);
        if ((locationUpdate && !input.value) || !prevUserPos) {
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
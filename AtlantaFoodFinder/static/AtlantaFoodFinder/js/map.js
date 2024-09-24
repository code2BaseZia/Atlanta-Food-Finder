let map, infoWindow, userMarker, watchId, accuracyCircle, placesService, userPos;
let restaurants, searchedRestaurants;
let restaurantMarkers = [];
// Variable for when position is updated to update rest. list
let prevUserPos = null;
let getNextPage;
let keyTimer;
let centeredOnce = false;

async function initMap() {
  let mapStyles = [
      {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [
              { visibility: 'off' }
          ]
      }
  ];

  // Initialize the map with a default center; this will be updated once the user's location is obtained
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 }, // Temporary center; will update to user's location
    zoom: 17,
    styles: mapStyles, // Customizes map display to only show restaurants
    disableDefaultUI: true,
  });

  infoWindow = new google.maps.InfoWindow();


  // Initialize the user marker with a blue dot icon
  userMarker = new google.maps.Marker({
    map: map,
    title: "Your Location",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#4285F4", // Google Blue
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    },
  });

  // Initialize the accuracy circle
  accuracyCircle = new google.maps.Circle({
    strokeColor: "#4285F4",
    strokeOpacity: 0.4,
    strokeWeight: 1,
    fillColor: "#4285F4",
    fillOpacity: 0.2,
    map: map,
    radius: 0, // Will be updated with accuracy
  });

  const input = document.getElementById('searchBar');

  // Use addEventListener on the input element (DOM)
  input.addEventListener("input", (e) => {
    clearTimeout(keyTimer);
    keyTimer = setTimeout( () => {
      const query = e.target.value;
      if (query) searchNearbyPlaces(query);
      else restaurants.forEach((restaurant) => {
        createRestaurantMarker(restaurant);
      });
      },500);
  });
  // Initialize the Places service
  placesService = new google.maps.places.PlacesService(map);

  // Start tracking the user's location & start autocomplete
  startTracking();
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
        if ((prevUserPos && (userPos.lat - prevUserPos.lat !== 0) && (userPos.lng - prevUserPos.lng !== 0)) || !prevUserPos) {
            showLoading(true);
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
// Search function used for keyword search for searchbox
function searchNearbyPlaces(keyword) {
  const request = {
    location: userMarker.getPosition(),  // User's current location
    radius: 1000,  // Radius in meters (adjust as needed)
    keyword: keyword,  // Search by keyword like 'pizza', 'coffee', etc.
    types: ['restaurant', 'cafe', 'bar', 'food'],
    rankPreference: google.maps.places.RankBy.DISTANCE,
  };

  // Use nearbySearch to search for places near the current location
  placesService.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearSearchedRestaurants();
      clearRestaurantMarkers();
      for (let i = 0; i < results.length; ++i) {
        createRestaurantMarker(results[i]);
        searchedRestaurants.push(results[i]);
      }
    } else {
      console.error('PlacesService nearbySearch failed due to: ' + status);
    }
  });
}
function clearRestaurants() {
    restaurants = [];
}
function clearSearchedRestaurants() {
    searchedRestaurants = [];
}
// Search function used to find restaurants around user
function fetchNearbyRestaurants(position) {
    const request = {
        location: new google.maps.LatLng(position.lat, position.lng),
        radius: 1000,
        types: ['restaurant', 'food', 'cafe', 'bar'],
        rankPreference: google.maps.places.RankBy.DISTANCE,
    };
    clearRestaurants();
    placesNearbyRestaurantSearch(request);
}
function placesNearbyRestaurantSearch(request) {
    placesService.nearbySearch(request, (results, status, pagination) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK && !results) {
            console.error('PlacesService was not successful for the following reason: ' + status);
        }
            if (pagination && pagination.hasNextPage) {
                getNextPage = () => {
                    pagination.nextPage();
                };
            }
            populateRestaurants(results, pagination);
            if (!pagination.hasNextPage) {
                showLoading(false); // Hide loading indicator
                clearRestaurantMarkers();
                restaurants.forEach((restaurant) => {
                    createRestaurantMarker(restaurant);
                });
            }
    });
}
  function populateRestaurants(results, pagination) {
    for (let i = 0; i < results.length; i++) {
        restaurants.push(results[i]); // Populate new restaurants to display details
    }
    if (getNextPage && pagination.hasNextPage) {
        getNextPage();
    }
  }
  // Create red pins at all found restaurants
  function createRestaurantMarker(place) {
  if (!place.geometry || !place.geometry.location) return;

  const icon = {
      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      scaledSize: new google.maps.Size(32, 32),
    };
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
    icon: icon,
  });

  // Add click listener to marker to show InfoWindow
  google.maps.event.addListener(marker, 'click', () => {
    const content = `
      <div class="info-window">
         ${!place.photos ? '' : `<img alt="Restaurant Image" src="${place.photos[0].getUrl()}" width="20%" height="10%" > </img>` }
        <h3>${place.name}</h3>
        <p>${place.vicinity}</p>
        ${place.rating ? `<p>Rating: ${place.rating} ⭐️</p>` : `<p>Rating Unavailable</p>`}
        <a href="${place.url}" target="_blank">View on Google Maps</a>
      </div>
    `;
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
  });

  // Store marker so we can clear them later
  restaurantMarkers.push(marker);
}

function clearRestaurantMarkers() {
  for (let i = 0; i < restaurantMarkers.length; i++) {
    restaurantMarkers[i].setMap(null);
  }
  restaurantMarkers = [];
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

  infoWindow.setPosition(pos);
  infoWindow.setContent(errorMessage);
  infoWindow.open(map);
}

function showLoading(show) {
  const loadingDiv = document.getElementById('loading');
  loadingDiv.style.display = show ? 'block' : 'none';
}

// Optional: Stop tracking when the user leaves the page
window.addEventListener("beforeunload", () => {
  if (watchId !== undefined) {
    navigator.geolocation.clearWatch(watchId);
  }
});

function reCenter() {
  map.setCenter(userMarker.position);
}

function zoom(delta) {
  map.setZoom(map.zoom + delta);
}

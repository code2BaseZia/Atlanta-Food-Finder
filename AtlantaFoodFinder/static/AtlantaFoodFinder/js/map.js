let map, infoWindow, userMarker, watchId, accuracyCircle, restaurants, getNextPage;
let restaurantMarkers = [];
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

  // Initialize the Places service
  placesService = new google.maps.places.PlacesService(map);

  // Start tracking the user's location & start autocomplete
  await startTracking();
}

function clearRestaurants() {
    restaurants = [];
}

// Search function used to find restaurants around user
function fetchNearbyRestaurants(position) {
    const request = {
        location: new google.maps.LatLng(position.lat, position.lng),
        types: ['restaurant', 'food', 'cafe', 'bar'],
        rankBy: google.maps.places.RankBy.DISTANCE,
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
                hideLoading() // Hide loading indicator
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
    showDetails(place);
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

// Optional: Stop tracking when the user leaves the page
window.addEventListener("beforeunload", () => {
  if (watchId !== undefined) {
    navigator.geolocation.clearWatch(watchId);
  }
});

function reCenter() {
  map.setCenter(userMarker.position);
  map.setZoom(17);
}

function zoom(delta) {
  map.setZoom(map.zoom + delta);
}

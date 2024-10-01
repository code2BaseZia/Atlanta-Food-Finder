let map, infoWindow, userMarker, watchId, accuracyCircle;
let restaurantMarkers = [];
let centeredOnce = false;

let AdvancedMarkerElement;

async function initMap() {
  const { Map } = await google.maps.importLibrary('maps');
  ({ AdvancedMarkerElement } = await google.maps.importLibrary('marker'));
  ({ Place, SearchByTextRankPreference, SearchNearbyRankPreference } = await google.maps.importLibrary('places'));

  // Initialize the map with a default center; this will be updated once the user's location is obtained
  map = new Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 }, // Temporary center; will update to user's location
    zoom: 17,
    disableDefaultUI: true,
    mapId: '4e0d254a4ffc45c6',
  });

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

  // Start tracking the user's location & start autocomplete
  await startTracking();
}

function clearRestaurants() {
    restaurants = [];
}

// Create red pins at all found restaurants
function createRestaurantMarker(place) {
  if (!place.location) return;

  const marker = new AdvancedMarkerElement({
    map,
    position: place.location,
    title: place.displayName,
  });

  // Add click listener to marker to show InfoWindow
  marker.addListener('gmp-click', () => {
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

initMap();

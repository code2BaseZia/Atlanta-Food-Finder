let map, infoWindow, userMarker, placesService, restaurantMarkers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 17,
    disableDefaultUI: true
  });

  // Create the search input and position it at the top center
  const inputDiv = document.createElement('div');
  const input = document.createElement('input');
  input.id = 'search-input';
  input.placeholder = 'Search for restaurants (e.g., "pizza")';
  inputDiv.appendChild(input);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(inputDiv);

  placesService = new google.maps.places.PlacesService(map);
  infoWindow = new google.maps.InfoWindow();
  userMarker = new google.maps.Marker({
    map: map,
    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#4285F4", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 },
  });

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
      const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
      userMarker.setPosition(pos);
    });
  }

  // Use addEventListener on the input element (DOM)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = e.target.value;
      if (query) searchNearbyPlaces(query);
    }
  });
}

function searchNearbyPlaces(keyword) {
  const request = {
    location: userMarker.getPosition(),  // User's current location
    radius: 1000,  // Radius in meters (adjust as needed)
    keyword: keyword,  // Search by keyword like 'pizza', 'coffee', etc.
  };

  // Use nearbySearch to search for places near the current location
  placesService.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearMarkers();
      results.forEach(createMarker);
    } else {
      console.error('PlacesService nearbySearch failed due to: ' + status);
    }
  });
}

function createMarker(place) {
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: { url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", scaledSize: new google.maps.Size(32, 32) },
  });

  // Use google.maps.event.addListener for Google Maps API events
  google.maps.event.addListener(marker, 'click', () => {
    infoWindow.setContent(`<div><strong>${place.name}</strong><br>${place.vicinity}</div>`);
    infoWindow.open(map, marker);
  });

  restaurantMarkers.push(marker);
}

function clearMarkers() {
  restaurantMarkers.forEach(marker => marker.setMap(null));
  restaurantMarkers = [];
}

function reCenter() {
  map.setCenter(userMarker.position);
}

function zoom(delta) {
  map.setZoom(map.zoom + delta);
}

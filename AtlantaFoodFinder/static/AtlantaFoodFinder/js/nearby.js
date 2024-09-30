// Search function used to find restaurants around user
function fetchNearbyRestaurants(position) {
    showLoading();
    const request = {
        fields: ['displayName', 'location', 'photos', 'formattedAddress', 'rating', 'userRatingCount'],
        locationRestriction: {
            center: new google.maps.LatLng(position.lat, position.lng),
            radius: 1500,
        },
        includedPrimaryTypes: ['restaurant', 'cafe', 'bar', 'coffee_shop', 'bakery'],
        rankPreference: SearchNearbyRankPreference.POPULARITY,
    };
    clearRestaurants();
    placesNearbyRestaurantSearch(request);
}

async function placesNearbyRestaurantSearch(request) {
    const { places } = await Place.searchNearby(request);
    populateRestaurants(places);
    hideLoading();
    clearRestaurantMarkers();
    restaurants.forEach((restaurant) => {
        createRestaurantMarker(restaurant);
    });
}

function populateRestaurants(results) {
    for (let i = 0; i < results.length; i++) {
        console.log(results[i]);
        restaurants.push(results[i]); // Populate new restaurants to display details
    }
}
// Search function used to find restaurants around user
function fetchNearbyRestaurants(position) {
    showLoading();

    const ranks = { popular: SearchByTextRankPreference.POPULARITY, close: SearchByTextRankPreference.DISTANCE }

    const request = {
        fields: ['displayName', 'location', 'photos', 'formattedAddress', 'rating', 'userRatingCount', 'businessStatus', 'priceLevel'],
        locationRestriction: {
            center: new google.maps.LatLng(position.lat, position.lng),
            radius: 1500,
        },
        includedPrimaryTypes: ['restaurant', 'cafe', 'bar', 'coffee_shop', 'bakery'],
        rankPreference: ranks[rankBy],
    };

    clearRestaurants();
    placesNearbyRestaurantSearch(request);
}

async function placesNearbyRestaurantSearch(request) {
    console.log(request);
    const {places} = await Place.searchNearby(request);
    restaurants = places;
    hideOptions();
    await updateViews(restaurants);
    hideLoading();
}
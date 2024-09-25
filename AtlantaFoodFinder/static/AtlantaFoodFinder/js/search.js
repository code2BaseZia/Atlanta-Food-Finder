let keyTimer, searchedRestaurants;
let showSearch = false;

gsap.set('#search', { xPercent: 120 });

function toggleSearch() {
    showSearch = !showSearch;
    if (showSearch) {
        gsap.set('#search', { xPercent: 0 });
        gsap.from('#search', { xPercent: 120, duration: 0.25, ease: 'power1.out' });
    } else {
        gsap.to('#search', { xPercent: 120, duration: 0.25, ease: 'power1.in' });
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

      const container = document.getElementById('results');

      for (let i = 0; i < results.length; ++i) {
        createRestaurantMarker(results[i]);
        searchedRestaurants.push(results[i]);

        const item = document.createElement('li');
        console.log(results[i]);
        item.innerHTML = `
            <div class="card image-full card-compact p-0 gap-0">
                ${ results[i].photos ? `<figure><img src="${results[i].photos[0].getUrl()}" alt="Restaurant Image" /></figure>` : '' }
                <div class="card-body h-full justify-center bg-base-200 bg-opacity-40 hover:bg-opacity-50 active:bg-opacity-60 transition-colors">
                    <h2 class="card-title grow-0">${ results[i].name }</h2>
                    <p class="grow-0">${ results[i].vicinity }</p>
                    ${ results[i].rating ? `<p class="flex flex-row gap-1 grow-0">Rating: ${results[i].rating}⭐</p>` : '<p class="grow-0">No Rating</p>' }
                    <a class="grow-0" href="${results[i].url}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
                </div>
            </div>
        `.trim();

        container.appendChild(item);
      }
    } else {
      console.error('PlacesService nearbySearch failed due to: ' + status);
    }
  });
}

function clearSearchedRestaurants() {
    searchedRestaurants = [];
    const container = document.getElementById('results');
    container.innerHTML = '';
}

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
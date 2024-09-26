let keyTimer, searchedRestaurants, filteredRestaurants, sortedRestaurants;

// All parameters for filters
let filter = {
    byRating: false,
    byPrice: false,
    byOpen: false,
    ratingFilter: 0.0,
    cuisineFilter:"",
    priceFilter:0,
};
// All parameters for sorting
const sort = Object.freeze({
    DISTANCE: 0,
    RATING: 1,
    NONE: -1
});
let currentSort = sort.NONE;

gsap.set('#search', { xPercent: 120 });

function toggleSearch() {
    showSearch = !showSearch;
    if (showSearch) {
        if (details) {
            hideDetails();
        }
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
    keyword: keyword,  // Search by keyword like 'pizza', 'coffee', etc.
    types: ['restaurant', 'cafe', 'bar', 'food'],
    rankBy: google.maps.places.RankBy.DISTANCE,
  };

  // Use nearbySearch to search for places near the current location
  placesService.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearSearchedRestaurants();
      searchedRestaurants = [...results];
      sortAndFilter();
      updateViews();
    } else {
      console.error('PlacesService nearbySearch failed due to: ' + status);
    }
  });
}

function clearSearchedRestaurants() {
    searchedRestaurants = [];
    const container = document.getElementById('results');
    container.innerHTML = '';
    clearRestaurantMarkers();
}

const input = document.getElementById('searchBar');

// Use addEventListener on the input element (DOM)
input.addEventListener("input", (e) => {
    clearTimeout(keyTimer);
    keyTimer = setTimeout( () => {
      const query = e.target.value;
      if (query) searchNearbyPlaces(query);
      else {
        clearSearchedRestaurants();
        restaurants.forEach((restaurant) => {
        createRestaurantMarker(restaurant);
      });
      }
    },500);
});

function sortAndFilter() {
    filteredRestaurants = searchedRestaurants.filter((restaurant) => {
    let ratingMatch = filter.byRating ? (restaurant.rating >= filter.ratingFilter) : true;
    let priceMatch = filter.byPrice ? (restaurant.price_level <= filter.priceFilter) : true;
    let openMatch = filter.byOpen ? restaurant.opening_hours.isOpen() : true;

    return ratingMatch && priceMatch && openMatch;
    });
    if (currentSort === sort.RATING) {
        sortedRestaurants = filteredRestaurants.toSorted((restaurantA,restaurantB) => restaurantA.rating - restaurantB.rating);
    } else sortedRestaurants = filteredRestaurants;
}

function updateViews() {
      clearRestaurantMarkers();

      const container = document.getElementById('results');

      for (let i = 0; i < sortedRestaurants.length; ++i) {
        createRestaurantMarker(sortedRestaurants[i]);
        searchedRestaurants.push(sortedRestaurants[i]);

        console.log(sortedRestaurants[i]);

        const item = document.createElement('li');
        item.innerHTML = `
            <div class="card image-full card-compact p-0 gap-0">
                ${ sortedRestaurants[i].photos ? `<figure><img src="${sortedRestaurants[i].photos[0].getUrl()}" alt="Restaurant Image" /></figure>` : '' }
                <div class="card-body h-full justify-center bg-base-200 bg-opacity-50 hover:bg-opacity-70 active:bg-opacity-80 transition-colors">
                    <h2 class="card-title grow-0">${ sortedRestaurants[i].name }</h2>
                    <p class="grow-0 ${ sortedRestaurants[i].opening_hours.open_now ? 'text-success' : 'text-error' }">${ sortedRestaurants[i].opening_hours.open_now ? 'Open' : 'Closed' }</p>
                    <p class="grow-0">${ sortedRestaurants[i].vicinity }</p>
                    ${ sortedRestaurants[i].rating ? `<p class="flex flex-row gap-1 grow-0 items-center">
                        Rating: ${sortedRestaurants[i].rating}
                        ${star.outerHTML}
                    </p>` : '<p class="grow-0">No Rating</p>' }
                </div>
            </div>
        `.trim();

        item.addEventListener('click', () => {
            showDetails(sortedRestaurants[i]);
        });

        container.appendChild(item);
      }
}
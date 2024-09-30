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
const sort = 'popularity';

const input = document.getElementById('searchBar');

const noSearch = () => {
    input.value = '';
    clearSearchedRestaurants();
    restaurants.forEach((restaurant) => {
        createRestaurantMarker(restaurant);
    });
}

gsap.set('#search', { xPercent: 120 });

function toggleSearch() {
    showSearch = !showSearch;
    if (showSearch) {
        if (details) {
            hideDetails();
        } else {
            gsap.set('#search', { xPercent: 0 });
            gsap.from('#search', { xPercent: 120, duration: 0.25, ease: 'power1.out' });
        }
    } else {
        gsap.to('#search', {
            xPercent: 120,
            duration: 0.25,
            ease: 'power1.in',
            onComplete: noSearch
        });
    }
}

// Search function used for keyword search for searchbox
async function searchNearbyPlaces(keyword) {
    console.log('search');
    const request = {
        textQuery: keyword,
        fields: ['displayName', 'location', 'photos', 'formattedAddress', 'rating', 'userRatingCount'],
        locationBias: userMarker.getPosition(),
        includedType: 'restaurant',
        rankBy: SearchByTextRankPreference.POPULARITY,
    };

    // Use nearbySearch to search for places near the current location
    const { places } = await Place.searchByText(request);
    clearSearchedRestaurants();
    searchedRestaurants = places;
    //sortAndFilter();
    await updateViews();
}

function clearSearchedRestaurants() {
    console.log('query');
    searchedRestaurants = [];
    const container = document.getElementById('results');
    container.innerHTML = '';
    clearRestaurantMarkers();
}

// Use addEventListener on the input element (DOM)
input.addEventListener("input", (e) => {
    clearTimeout(keyTimer);
    keyTimer = setTimeout( () => {
      const query = e.target.value;
      if (query) searchNearbyPlaces(query);
      else noSearch();
    },500);
});

async function sortAndFilter() {
    filteredRestaurants = await searchedRestaurants.filter(async (restaurant) => {
    let ratingMatch = filter.byRating ? (restaurant.rating >= filter.ratingFilter) : true;
    let priceMatch = filter.byPrice ? (restaurant.priceLevel <= filter.priceFilter) : true;
    let openMatch = filter.byOpen ? await restaurant.isOpen() : true;

    return ratingMatch && priceMatch && openMatch;
    });
    if (currentSort === sort.RATING) {
        sortedRestaurants = filteredRestaurants.toSorted((restaurantA,restaurantB) => restaurantA.rating - restaurantB.rating);
    } else sortedRestaurants = filteredRestaurants;
}

async function updateViews() {
      clearRestaurantMarkers();
      console.log('update');

      const container = document.getElementById('results');

      for (let i = 0; i < searchedRestaurants.length; ++i) {
        createRestaurantMarker(searchedRestaurants[i]);

        const item = document.createElement('li');
        const isOpen = await searchedRestaurants[i].isOpen();

        item.innerHTML = `
            <div class="card image-full card-compact p-0 gap-0">
                ${ searchedRestaurants[i].photos ? `<figure><img src="${searchedRestaurants[i].photos[0].getURI()}" alt="Restaurant Image" /></figure>` : '' }
                <div class="card-body h-full justify-center bg-base-200 bg-opacity-50 hover:bg-opacity-70 active:bg-opacity-80 transition-colors">
                    <h2 class="card-title grow-0">${ searchedRestaurants[i].displayName }</h2>
                    <p class="grow-0 ${ isOpen ? 'text-success' : 'text-error' }">${ isOpen ? 'Open' : 'Closed' }</p>
                    <p class="grow-0">${ searchedRestaurants[i].formattedAddress }</p>
                    ${ searchedRestaurants[i].rating ? `<p class="flex flex-row gap-1 grow-0 items-center">
                        Rating: ${searchedRestaurants[i].rating}
                        ${star.outerHTML}
                    </p>` : '<p class="grow-0">No Rating</p>' }
                </div>
            </div>
        `.trim();

        item.addEventListener('click', () => {
            showDetails(searchedRestaurants[i]);
        });

        container.appendChild(item);
      }
}
let keyTimer, searchedRestaurants, filteredRestaurants, sortedRestaurants;

// All parameters for filters
let filter = {
    byDistance: false,
    byRating: false,
    byPrice: false,
    byOpen: false,
    distanceFilter: 0.0,
    ratingFilter: 0.0,
    priceFilter: { min: 1, max: 4 },
};
// All parameters for sorting
const find = 'popularity';

const sort = 'rating';

const input = document.getElementById('searchBar');
const container = document.getElementById('results');

const noSearch = () => {
    input.value = '';
    clearSearchedRestaurants();
    updateViews(restaurants);
}

gsap.set('#search', { xPercent: 120 });

function toggleSearch() {
    if (details) {
        showSearch = true;
    } else {
        showSearch = !showSearch;
    }

    if (showSearch) {
        if (details) {
            hideDetails();
        } else {
            gsap.set('#search', { xPercent: 0 });
            gsap.from('#search', { xPercent: 120, duration: 0.25, ease: 'power1.out' });
        }
    } else {
        if (!details) {
            gsap.to('#search', {
                xPercent: 120,
                duration: 0.25,
                ease: 'power1.in',
                onComplete: noSearch
            });
        }
    }
}

// Search function used for keyword search for searchbox
async function searchNearbyPlaces(keyword) {
    const request = {
        textQuery: keyword,
        fields: ['displayName', 'location', 'photos', 'formattedAddress', 'rating', 'userRatingCount', 'businessStatus', 'priceLevel'],
        locationBias: userMarker.getPosition(),
        includedType: 'restaurant',
        rankBy: SearchByTextRankPreference.DISTANCE,
    };

    // Use nearbySearch to search for places near the current location
    const { places } = await Place.searchByText(request);
    clearSearchedRestaurants();
    searchedRestaurants = places;
    //sortAndFilter();
    await updateViews(places);
}

function clearSearchedRestaurants() {
    searchedRestaurants = [];
    container.innerHTML = '';
    clearRestaurantMarkers();
}

function handleSearch() {
    const query = input.value;
    if (query) searchNearbyPlaces(query);
    else noSearch();
}

// Use addEventListener on the input element (DOM)
input.addEventListener("input", () => {
    clearTimeout(keyTimer);
    keyTimer = setTimeout(handleSearch,500);
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

async function updateViews(results) {
    clearRestaurantMarkers();

    results.forEach((result) => createRestaurantMarker(result));

    for (let i = 0; i < results.length; ++i) {
        const item = document.createElement('li');

        let statusColor, statusText;
        const isOpen = await results[i].isOpen();
        switch (results[i].businessStatus) {
            case BusinessStatus.CLOSED_PERMANENTLY:
                statusColor = 'text-error';
                statusText = 'Permanently Closed';
                break;
            case BusinessStatus.CLOSED_TEMPORARILY:
                statusColor = 'text-warning';
                statusText = 'Temporarily Closed';
                break;
            default:
                statusColor = isOpen ? 'text-success' : 'text-error';
                statusText = isOpen ? 'Open' : 'Closed';
        }

        let priceIndicator;
        switch (results[i].priceLevel) {
            case PriceLevel.INEXPENSIVE:
                priceIndicator = '$';
                break;
            case PriceLevel.MODERATE:
                priceIndicator = '$$';
                break;
            case PriceLevel.EXPENSIVE:
                priceIndicator = '$$$'
                break;
            case PriceLevel.VERY_EXPENSIVE:
                priceIndicator = '$$$$';
                break;
            default:
                priceIndicator = '';
        }

        item.innerHTML = `
            <div class="card image-full card-compact p-0 gap-0">
                ${ results[i].photos ? `<figure><img src="${results[i].photos[0].getURI()}" alt="Restaurant Image" /></figure>` : '' }
                <div class="card-body h-full justify-center bg-base-200 bg-opacity-50 hover:bg-opacity-70 active:bg-opacity-80 transition-colors">
                    <div class="w-full flex flex-row justify-between items-center">
                        <h2 class="card-title grow-0 font-heading text-2xl">${ results[i].displayName }</h2>
                        <p class="grow-0 ${ statusColor }">${ statusText }</p>
                    </div>
                    <p class="grow-0">${ results[i].formattedAddress }</p>
                    <span class="w-full flex flex-row justify-between">
                        ${ results[i].rating ? `<p class="flex flex-row gap-1 grow-0 items-center">
                            Rating: ${results[i].rating}
                            ${star.outerHTML}
                            (${results[i].userRatingCount})
                        </p>` : '<p class="grow-0">No Ratings</p>' }
                        <p class="grow-0">${priceIndicator}</p>
                    </span>
                </div>
            </div>
        `.trim();

        item.addEventListener('click', () => {
            showDetails(results[i]);
        });

        container.appendChild(item);
    }
}
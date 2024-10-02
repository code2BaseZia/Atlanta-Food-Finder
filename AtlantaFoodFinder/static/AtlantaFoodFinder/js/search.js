let keyTimer, searchedRestaurants;

const input = document.getElementById('searchBar');
const container = document.getElementById('results');

const noSearch = () => {
    input.value = '';
    clearSearchedRestaurants();
    hideOptions();
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
            hideDetails('#search');
        } else if (showFavorites) {
            gsap.to('#favorites', {
                xPercent: 120,
                duration: 0.25,
                ease: 'power1.in',
                onComplete: () => {
                    gsap.set('#search', { xPercent: 0 });
                    gsap.from('#search', { xPercent: 120, duration: 0.25, ease: 'power1.out' });
                }
            });
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
    const ranks = { popular: SearchByTextRankPreference.RELEVANCE, close: SearchByTextRankPreference.DISTANCE }

    const request = {
        textQuery: keyword,
        fields: ['displayName', 'location', 'photos', 'formattedAddress', 'rating', 'userRatingCount', 'businessStatus', 'priceLevel'],
        includedType: 'restaurant',
        rankPreference: ranks[rankBy],
    };

    if (filters.distance.on) {
        request.locationRestriction = createBounds(userPos, filters.distance.value);
    } else {
        request.locationBias = userPos;
    }
    if (filters.rating.on) {
        request.minRating = parseFloat(filters.rating.value);
    }
    if (filters.price.on) {
        const levels = [PriceLevel.INEXPENSIVE, PriceLevel.MODERATE, PriceLevel.EXPENSIVE, PriceLevel.VERY_EXPENSIVE];
        request.priceLevels = levels.slice(filters.price.min - 1, filters.price.max);
    }
    if (filters.open.on) {
        request.isOpenNow = true;
    }

    // Use nearbySearch to search for places near the current location
    const { places } = await Place.searchByText(request);
    searchedRestaurants = places;
    showOptions();
    clientSort();
}

function clearSearchedRestaurants() {
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

async function updateViews(results) {
    clearSearchedRestaurants();

    results.forEach((result) => createRestaurantMarker(result));

    for (let i = 0; i < results.length; ++i) {
        const item = await createCard(results[i]);
        container.appendChild(item);
    }
}

async function createCard(restaurant) {
    const item = document.createElement('li');

    let statusColor, statusText;
    const isOpen = await restaurant.isOpen();
    switch (restaurant.businessStatus) {
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
    switch (restaurant.priceLevel) {
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
            ${ restaurant.photos && restaurant.photos.length > 0 ? `<figure><img src="${restaurant.photos[0].getURI()}" alt="Restaurant Image" /></figure>` : '' }
            <div class="card-body h-full justify-center bg-base-200 bg-opacity-50 hover:bg-opacity-70 active:bg-opacity-80 transition-colors">
                <div class="w-full flex flex-row justify-between items-center">
                    <h2 class="card-title grow-0 font-heading text-2xl">${ restaurant.displayName }</h2>
                    <p class="grow-0 ${ statusColor }">${ statusText }</p>
                </div>
                <p class="grow-0">${ restaurant.formattedAddress }</p>
                <span class="w-full flex flex-row justify-between">
                    ${ restaurant.rating ? `<p class="flex flex-row gap-1 grow-0 items-center">
                        Rating: ${restaurant.rating}
                        ${star.outerHTML}
                        (${restaurant.userRatingCount})
                    </p>` : '<p class="grow-0">No Ratings</p>' }
                    <p class="grow-0">${priceIndicator}</p>
                </span>
            </div>
        </div>
    `.trim();

    item.addEventListener('click', () => {
        showDetails(restaurant);
    });

    return item;
}
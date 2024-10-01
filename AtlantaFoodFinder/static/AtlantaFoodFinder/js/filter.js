const popReg = document.getElementById('popReg');

const find = { dropdown: document.getElementById('find') };
find.selected = find.dropdown.getElementsByTagName('summary').item(0).getElementsByTagName('span').item(0);
find.labels = find.dropdown.getElementsByTagName('label');

const sort = { dropdown: document.getElementById('sort') };
sort.selected = sort.dropdown.getElementsByTagName('summary').item(0).getElementsByTagName('span').item(0);
sort.labels = sort.dropdown.getElementsByTagName('label');

const filter = { dropdown: document.getElementById('filter') };
filter.checkboxes = filter.dropdown.getElementsByTagName('input');

const forms = {
    distance: { base: document.getElementById('distance') },
    rating: { base: document.getElementById('rating') },
    price: { base: document.getElementById('price') }
};

forms.distance.tooltip = forms.distance.base.getElementsByClassName('tooltip').item(0);
forms.distance.slider = forms.distance.base.getElementsByClassName('slider').item(0);

forms.rating.tooltip = forms.rating.base.getElementsByClassName('tooltip').item(0);
forms.rating.slider = forms.rating.base.getElementsByClassName('slider').item(0);

forms.price.slider = {
    min: forms.price.base.getElementsByClassName('min-slider').item(0),
    max: forms.price.base.getElementsByClassName('max-slider').item(0),
};

const filters = {
    distance: { on: false, value: 5.0 },
    rating: { on: false, value: 0.0 },
    price: { on: false, min: 1, max: 4 },
    open: { on: false }
}

let rankBy = 'popular';

let sortOrder = 'none';

const createBounds = (pos, r) => {
    let R = 3958.8; // Radius of the Earth in miles
    let rad = r / R;
    let deg = rad / (Math.PI/180);

    return {
        east: pos.lng + deg,
        north: pos.lat + deg,
        south: pos.lat - deg,
        west: pos.lng - deg,
    };
}

function clientSort() {
    let sortedRestaurants;
    const priceLevels = { FREE: 0, INEXPENSIVE: 1, MODERATE: 2, EXPENSIVE: 3, VERY_EXPENSIVE: 4 };

    const query = input.value;
    if (query) sortedRestaurants = [...searchedRestaurants];
    else sortedRestaurants = [...restaurants];

    switch (sortOrder) {
        case 'distance':
            sortedRestaurants.sort(
                (a, b) => haversine_distance(userPos, a.location) - haversine_distance(userPos, b.location)
            );
            break;
        case 'rating':
            sortedRestaurants.sort((a, b) => b.rating - a.rating);
            break;
        case 'priceA':
            sortedRestaurants.sort((a, b) => priceLevels[a.priceLevel] - priceLevels[b.priceLevel]);
            break;
        case 'priceD':
            sortedRestaurants.sort((a, b) => priceLevels[b.priceLevel] - priceLevels[a.priceLevel]);
            break;
    }

    console.log(sortedRestaurants);
    updateViews(sortedRestaurants);
}

function hideOptions() {
    popReg.innerHTML = 'Most Popular';
    if (rankBy === 'popular') {
        find.selected.innerHTML = popReg.innerHTML;
    }

    filter.dropdown.classList.add('hidden');

    forms.distance.base.classList.add('hidden');
    forms.rating.base.classList.add('hidden');
    forms.price.base.classList.add('hidden');
}

function showOptions () {
    popReg.innerHTML = 'Most Relevant';
    if (rankBy === 'popular') {
        find.selected.innerHTML = popReg.innerHTML;
    }

    filter.dropdown.classList.remove('hidden');

    if (filters.distance.on) {
        forms.distance.base.classList.remove('hidden');
    }
    if (filters.rating.on) {
        forms.rating.base.classList.remove('hidden');
    }
    if (filters.price.on) {
        forms.price.base.classList.remove('hidden');
    }
}

for (let label of find.labels) {
    const name = label.getElementsByTagName('span').item(0).innerHTML;
    const radio = label.getElementsByTagName('input').item(0);
    radio.addEventListener('change', () => {
        find.selected.innerHTML = name;
        rankBy = radio.value;
        if (!input.value) {
            fetchNearbyRestaurants(userPos);
        }
        handleSearch();
    });
}

for (let label of sort.labels) {
    const name = label.getElementsByTagName('span').item(0).innerHTML;
    const radio = label.getElementsByTagName('input').item(0);
    radio.addEventListener('change', () => {
        sort.selected.innerHTML = name;
        sortOrder = radio.value;
        clientSort();
    });
}

for (let checkbox of filter.checkboxes) {
    checkbox.addEventListener('change', (e) => {
        filters[e.currentTarget.name].on = e.currentTarget.checked;
        if (e.currentTarget.name !== 'open') {
            if (e.currentTarget.checked) {
                forms[e.currentTarget.name].base.classList.remove('hidden');
            } else {
                forms[e.currentTarget.name].base.classList.add('hidden');
            }
        }
        handleSearch();
    });
}

forms.distance.slider.addEventListener('input', (e) => {
    const value = e.currentTarget.value;
    forms.distance.tooltip.style.setProperty('--slider-progress', value / 5);
    forms.distance.tooltip.setAttribute('data-tip', parseFloat(value).toFixed(1) + ' mi');
    filters.distance.value = value;
});

forms.distance.slider.addEventListener('change', handleSearch);

forms.rating.slider.addEventListener('input', (e) => {
    const value = e.currentTarget.value;
    forms.rating.tooltip.style.setProperty('--slider-progress', value / 5);
    forms.rating.tooltip.setAttribute('data-tip', parseFloat(value).toFixed(1));
    filters.rating.value = value;
});

forms.rating.slider.addEventListener('change', handleSearch);

forms.price.slider.min.addEventListener('input', (e) => {
    const value = e.currentTarget.value;
    if (value > forms.price.slider.max.value) {
        forms.price.slider.max.value = value;
    }
    filters.price.min = value;
    filters.price.max = forms.price.slider.max.value;
});

forms.price.slider.min.addEventListener('change', handleSearch);

forms.price.slider.max.addEventListener('input', (e) => {
    const value = e.currentTarget.value;
    if (value < forms.price.slider.min.value) {
        forms.price.slider.min.value = value;
    }
    filters.price.min = forms.price.slider.min.value;
    filters.price.max = value;
});

forms.price.slider.max.addEventListener('change', handleSearch);
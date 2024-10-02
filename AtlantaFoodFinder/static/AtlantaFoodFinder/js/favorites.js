let currentRestaurant;
let favorite = false;
let showFavorites = false;

const favsContainer = document.getElementById('favoriteRestaurants');

gsap.set('#favorites', { xPercent: 120 });

function toggleFavorites() {
    if (showSearch || details) {
        showFavorites = true;
    } else {
        showFavorites = !showFavorites;
    }

    if (showFavorites) {
        getFavorites();

        if (details) {
            hideDetails('#favorites');
        } else if (showSearch) {
            showSearch = false;
            gsap.to('#search', {
                xPercent: 120,
                duration: 0.25,
                ease: 'power1.in',
                onComplete: () => {
                    noSearch();
                    gsap.set('#favorites', { xPercent: 0 });
                    gsap.from('#favorites', { xPercent: 120, duration: 0.25, ease: 'power1.out' });
                }
            });
        } else {
            gsap.set('#favorites', { xPercent: 0 });
            gsap.from('#favorites', { xPercent: 120, duration: 0.25, ease: 'power1.out' });
        }
    } else {
        gsap.to('#favorites', {
            xPercent: 120,
            duration: 0.25,
            ease: 'power1.in',
        });
    }
}

const starIcon = document.getElementById('favoriteIcon');

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function initFavorites(restaurant) {
    currentRestaurant = restaurant;
    const response = await fetch(`favorites/?id=${currentRestaurant}`);
    if (response.ok) {
        const json = await response.json();
        console.log(json);
        favorite = json.favorites;
        if (favorite) {
            starIcon.classList.remove('fill-none');
            starIcon.classList.add('fill-accent');
        } else {
            starIcon.classList.remove('fill-accent');
            starIcon.classList.add('fill-none');
        }
    }
}

async function handleFavorite() {
    const token = getCookie('csrftoken');

    const headers = new Headers();
    headers.append('X-CSRFToken', token);

    favorite = !favorite
    if (favorite) {
        starIcon.classList.remove('fill-none');
        starIcon.classList.add('fill-accent');
    } else {
        starIcon.classList.remove('fill-accent');
        starIcon.classList.add('fill-none');
    }

    await fetch('favorites/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            id: currentRestaurant
        })
    });
    await initFavorites(currentRestaurant);
}

async function getFavorites() {
    const response = await fetch(`favorites/`);
    if (response.ok) {
        const json = await response.json();
        displayFavorites(json.favorites);
    }
}

async function displayFavorites(favs) {
    for (let fav of favs) {
        const favPlace = new Place({ id: fav });
        await favPlace.fetchFields({
            fields: ['displayName', 'location', 'photos', 'formattedAddress', 'rating', 'userRatingCount', 'businessStatus', 'priceLevel']
        })

        const card = await createCard(favPlace);
        favsContainer.appendChild(card);
    }
}
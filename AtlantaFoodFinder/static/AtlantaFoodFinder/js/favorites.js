let currentRestaurant;
let favorite = false;

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

    await fetch('favorites/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            id: currentRestaurant
        })
    });
    await initFavorites(currentRestaurant);
}
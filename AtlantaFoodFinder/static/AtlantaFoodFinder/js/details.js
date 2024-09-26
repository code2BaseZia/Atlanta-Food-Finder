const element = document.getElementById('details');
const figure = element.getElementsByTagName('figure').item(0);
const image = element.getElementsByTagName('img').item(0);
const title = element.getElementsByClassName('card-title').item(0);
const address = element.getElementsByClassName('address').item(0);
const rating = element.getElementsByClassName('rating').item(0);
const number = rating.getElementsByClassName('number').item(0);
const stars = rating.getElementsByClassName('stars').item(0);
const open = element.getElementsByClassName('open').item(0);
const link = element.getElementsByClassName('link').item(0);

const placeholder = document.createElement('span');
placeholder.className = 'invisible';
placeholder.innerHTML = 'Loading restaurant detail...';

gsap.set(element, { xPercent: 120 });

function showSkeletons() {
    title.innerHTML = placeholder.outerHTML;
    address.innerHTML = placeholder.outerHTML;
    number.innerHTML = placeholder.outerHTML;
    stars.innerHTML = placeholder.outerHTML;
    open.innerHTML = placeholder.outerHTML;
    link.removeAttribute('href');

    figure.removeChild(image);
    figure.classList.add('skeleton');
    figure.classList.add('h-72');
    title.classList.add('skeleton');
    address.classList.add('skeleton');
    rating.classList.add('skeleton');
    open.classList.add('skeleton');
    link.classList.add('skeleton');
}

function hideSkeletons() {
    figure.appendChild(image);
    figure.classList.remove('skeleton');
    figure.classList.remove('h-72');
    title.classList.remove('skeleton');
    address.classList.remove('skeleton');
    rating.classList.remove('skeleton');
    open.classList.remove('skeleton')
    link.classList.remove('skeleton');
}

function getDetails(place) {
    showSkeletons();
    const request = {
        placeId: place.place_id,
        fields: ['formatted_address', 'name', 'photo', 'type', 'url', 'formatted_phone_number', 'opening_hours', 'website', 'price_level', 'rating', 'reviews', 'user_ratings_total']
    }
    placesService.getDetails(request, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log(result);

            image.setAttribute('src', result.photos[0].getUrl());
            title.innerHTML = result.name;
            address.innerHTML = result.formatted_address;
            number.innerHTML = result.rating.toString();
            stars.innerHTML = star.outerHTML.repeat(Math.round(result.rating));
            open.innerHTML = result.opening_hours.open_now ? 'Open' : 'Closed';
            open.classList.remove('text-success');
            open.classList.remove('text-error');
            open.classList.add(result.opening_hours.open_now ? 'text-success' : 'text-error');
            link.setAttribute('href', result.url);

            hideSkeletons();
        }
    })
}

function showDetails(place) {
    if (details) {
        gsap.to(element, {
            xPercent: 120,
            duration: 0.25,
            ease: 'power1.in',
            onComplete: () => {
                getDetails(place);
                gsap.to(element, { xPercent: 0, duration: 0.25, ease: 'power1.out' });
            }
        });
    } else if (showSearch) {
        gsap.to('#search', {
            xPercent: 120,
            duration: 0.25,
            ease: 'power1.in',
            onComplete: () => {
                getDetails(place);
                details = true;
                gsap.set(element, { xPercent: 0 });
                gsap.from(element, { xPercent: 120, duration: 0.25, ease: 'power1.out' });
            }
        });
    } else {
        getDetails(place);
        details = true;
        gsap.set(element, { xPercent: 0 });
        gsap.from(element, { xPercent: 120, duration: 0.25, ease: 'power1.out' });
    }
}

function hideDetails() {
    if (details) {
        details = false;
        gsap.to(element, {
            xPercent: 120,
            duration: 0.25,
            ease: 'power1.in',
            onComplete: () => {
                if (showSearch) {
                    gsap.set('#search', { xPercent: 0 });
                    gsap.from('#search', { xPercent: 120, duration: 0.25, ease: 'power1.out' });
                }
            }
        });
    }
}
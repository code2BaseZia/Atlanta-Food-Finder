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
    figure.classList.add('skeleton', 'h-72');
    title.classList.add('skeleton', 'text-transparent');
    address.classList.add('skeleton', 'text-transparent');
    rating.classList.add('skeleton', 'text-transparent');
    open.classList.add('skeleton', 'text-transparent');
    link.classList.add('skeleton', 'text-transparent');
}

function hideSkeletons() {
    figure.appendChild(image);
    figure.classList.remove('skeleton', 'h-72');
    title.classList.remove('skeleton', 'text-transparent');
    address.classList.remove('skeleton', 'text-transparent');
    rating.classList.remove('skeleton', 'text-transparent');
    open.classList.remove('skeleton', 'text-transparent')
    link.classList.remove('skeleton', 'text-transparent');
}

async function getDetails(place) {
    showSkeletons();
    const fields = [
        'businessStatus', 'formattedAddress', 'displayName', 'photos', 'types', 'regularOpeningHours',
        'nationalPhoneNumber', 'websiteURI', 'hasCurbsidePickup', 'hasDelivery', 'hasDineIn', 'editorialSummary',
        'priceLevel', 'rating', 'isReservable', 'reviews', 'servesBreakfast', 'servesBrunch', 'servesDinner',
        'servesLunch', 'servesVegetarianFood', 'hasTakeout', 'userRatingCount', 'googleMapsURI', 'location'
    ];

    await place.fetchFields({fields});

    map.panTo(place.location);

    console.log(place);

    const isOpen = await place.isOpen();

    image.setAttribute('src', place.photos[0].getURI());
    title.innerHTML = place.displayName;
    address.innerHTML = place.formattedAddress;
    number.innerHTML = place.rating.toString();
    stars.innerHTML = star.outerHTML.repeat(Math.round(place.rating));
    open.innerHTML = isOpen ? 'Open' : 'Closed';
    open.classList.remove('text-success');
    open.classList.remove('text-error');
    open.classList.add(isOpen ? 'text-success' : 'text-error');
    link.setAttribute('href', place.googleMapsURI);

    hideSkeletons();
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
const element = { base: document.getElementById('details') };
element.figure = { base: element.base.getElementsByTagName('figure').item(0) };
element.figure.image = element.figure.base.getElementsByTagName('img').item(0);
element.body = {
    title: element.base.getElementsByClassName('card-title').item(0),
    open: element.base.getElementsByClassName('open').item(0),
    address: element.base.getElementsByClassName('address').item(0),
    rating: { base: element.base.getElementsByClassName('rating').item(0) },
    price: element.base.getElementsByClassName('price').item(0),
    link: element.base.getElementsByClassName('link').item(0),
};
element.body.rating = {
    ...element.body.rating,
    number: element.body.rating.base.getElementsByClassName('number').item(0),
    count: element.body.rating.base.getElementsByClassName('count').item(0),
    stars: element.body.rating.base.getElementsByClassName('stars').item(0)
};
element.info = {
    desc: element.base.getElementsByClassName('desc').item(0),
    types: element.base.getElementsByClassName('types').item(0),
    price: element.base.getElementsByClassName('price-level').item(0),
    payment: element.base.getElementsByClassName('payment-methods').item(0),
    grid: { base: element.base.getElementsByClassName('info-grid').item(0) },
};
element.info.grid = {
    ...element.info.grid,
    breakfast: element.info.grid.base.getElementsByClassName('breakfast').item(0),
    brunch: element.info.grid.base.getElementsByClassName('brunch').item(0),
    lunch: element.info.grid.base.getElementsByClassName('lunch').item(0),
    dinner: element.info.grid.base.getElementsByClassName('dinner').item(0),
    cocktails: element.info.grid.base.getElementsByClassName('cocktails').item(0),
    dineIn: element.info.grid.base.getElementsByClassName('dine-in').item(0),
    reserve: element.info.grid.base.getElementsByClassName('reserve').item(0),
    takeout: element.info.grid.base.getElementsByClassName('takeout').item(0),
    deliver: element.info.grid.base.getElementsByClassName('deliver').item(0),
    pickup: element.info.grid.base.getElementsByClassName('pickup').item(0),
}
element.contact = {
    phone: element.base.getElementsByClassName('phone').item(0),
    website: element.base.getElementsByClassName('website').item(0),
    hours: element.base.getElementsByClassName('hours').item(0),
}
element.reviews = element.base.getElementsByClassName('reviews').item(0);

const insertSymbol = (element, on) => {
    element.insertBefore((on ? check : x).cloneNode(true), element.childNodes[0]);
    element.classList.remove('text-transparent');
    element.classList.add(on ? 'text-success' : 'text-error');
}

const placeholder = document.createElement('span');
placeholder.className = 'text-transparent';
placeholder.innerHTML = 'Loading restaurant detail...';

gsap.set(element.base, { xPercent: 120 });

function showSkeletons() {
    element.body.title.innerHTML = placeholder.outerHTML;
    element.body.open.innerHTML = placeholder.outerHTML;
    element.body.address.innerHTML = placeholder.outerHTML;
    element.body.rating.number.innerHTML = placeholder.outerHTML;
    element.body.rating.stars.innerHTML = placeholder.outerHTML;
    element.body.rating.count.innerHTML = placeholder.outerHTML;
    element.body.price.innerHTML = placeholder.outerHTML;
    element.body.link.removeAttribute('href');

    element.info.desc.innerHTML = placeholder.outerHTML;
    element.info.types.innerHTML = placeholder.outerHTML;
    element.info.price.innerHTML = placeholder.outerHTML;
    element.info.payment.innerHTML = placeholder.outerHTML;
    Object.entries(element.info.grid).forEach(([ _, v]) => {
        console.log(v);
        v.removeChild(v.childNodes[0]);
        v.classList.remove('text-success', 'text-error');
        v.classList.add('text-transparent');
    });

    element.contact.phone.innerHTML = placeholder.outerHTML;
    element.contact.website.innerHTML = placeholder.outerHTML;
    element.contact.website.removeAttribute('href');
    element.contact.hours.innerHTML = '';

    element.reviews.innerHTML = '';

    element.figure.base.removeChild(element.figure.image);
    element.figure.base.classList.add('skeleton', 'h-72');
    element.body.title.classList.add('skeleton');
    element.body.open.classList.add('skeleton');
    element.body.address.classList.add('skeleton');
    element.body.rating.base.classList.add('skeleton');
    element.body.price.classList.add('skeleton');
    element.body.link.classList.add('skeleton', 'text-transparent');

    element.info.desc.classList.add('skeleton');
    element.info.types.classList.add('skeleton');
    element.info.price.classList.add('skeleton');
    element.info.payment.classList.add('skeleton');
    element.info.grid.base.classList.add('skeleton');

    element.contact.phone.classList.add('skeleton');
    element.contact.website.classList.add('skeleton');
}

function hideSkeletons() {
    element.figure.base.appendChild(element.figure.image);
    element.figure.base.classList.remove('skeleton', 'h-72');
    element.body.title.classList.remove('skeleton');
    element.body.open.classList.remove('skeleton');
    element.body.address.classList.remove('skeleton');
    element.body.rating.base.classList.remove('skeleton');
    element.body.price.classList.remove('skeleton');
    element.body.link.classList.remove('skeleton', 'text-transparent');

    element.info.desc.classList.remove('skeleton');
    element.info.types.classList.remove('skeleton');
    element.info.price.classList.remove('skeleton');
    element.info.payment.classList.remove('skeleton');
    element.info.grid.base.classList.remove('skeleton');

    element.contact.phone.classList.remove('skeleton');
    element.contact.website.classList.remove('skeleton');
}

async function getDetails(place) {
    showSkeletons();
    /*
     * Info:
     *   Summary: editorialSummary
     *   Types: types
     *   Price: priceLevel, paymentOptions
     *   Methods: hasCurbsidePickup, hasDelivery, hasDineIn, isReservable, hasTakeout
     *   Meals: servesBreakfast, servesBrunch, servesDinner, servesLunch
     *   Extras (DO LATER): hasLiveMusic, isGoodForGroups, isGoodForKids, allowsDogs, isGoodForWatchingSports, parkingOptions
     * Contact: nationalPhoneNumber, websiteURI, regularOpeningHours
     * Reviews: reviews
    */
    const fields = [
        'businessStatus', 'formattedAddress', 'displayName', 'photos', 'types', 'regularOpeningHours',
        'nationalPhoneNumber', 'websiteURI', 'hasCurbsidePickup', 'hasDelivery', 'hasDineIn', 'editorialSummary',
        'priceLevel', 'rating', 'isReservable', 'reviews', 'servesBreakfast', 'servesBrunch', 'servesDinner',
        'servesLunch', 'servesCocktails', 'hasTakeout', 'userRatingCount', 'googleMapsURI', 'location', 'paymentOptions'
    ];

    await place.fetchFields({fields});

    initFavorites(place.id);

    map.panTo(place.location);

    console.log(place);

    let statusColor, statusText;
    const isOpen = await place.isOpen();
    switch (place.businessStatus) {
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

    let priceIndicator, priceText;
    switch (place.priceLevel) {
        case PriceLevel.FREE:
            priceIndicator = '';
            priceText = 'Free!'
            break;
        case PriceLevel.INEXPENSIVE:
            priceIndicator = '$';
            priceText = 'Typically under $10 per person';
            break;
        case PriceLevel.MODERATE:
            priceIndicator = '$$';
            priceText = 'Typically between $10 and $25 per person';
            break;
        case PriceLevel.EXPENSIVE:
            priceIndicator = '$$$';
            priceText = 'Typically between $25 and $50 per person';
            break;
        case PriceLevel.VERY_EXPENSIVE:
            priceIndicator = '$$$$';
            priceText = 'Typically over $50 per person';
            break;
        default:
            priceIndicator = '';
            priceText = 'No price information available';
    }

    let paymentMethods = 'Accepts: ';
    if (place.paymentOptions?.acceptsCashOnly) {
        paymentMethods += 'cash only, ';
    }
    if (place.paymentOptions?.acceptsCreditCards) {
        paymentMethods += 'credit card, ';
    }
    if (place.paymentOptions?.acceptsDebitCards) {
        paymentMethods += 'debit card, ';
    }
    if (place.paymentOptions?.acceptsNFC) {
        paymentMethods += 'contactless, ';
    }

    if (place.photos && place.photos[0] && place.photos[0].getURI()) {
        element.figure.image.setAttribute('src', place.photos[0].getURI());
    }
    element.body.title.innerHTML = place.displayName;
    element.body.open.innerHTML = statusText;
    element.body.open.classList.remove('text-success', 'text-error', 'text-warning');
    element.body.open.classList.add(statusColor);
    element.body.address.innerHTML = place.formattedAddress || 'No address found';
    element.body.rating.number.innerHTML = (place.rating || 'No ratings').toString();
    element.body.rating.stars.innerHTML = place.rating ? star.outerHTML.repeat(Math.round(place.rating)) : '';
    element.body.rating.count.innerHTML = `(${place.userRatingCount || 0})`;
    element.body.price.innerHTML = priceIndicator || '';
    if (place.googleMapsURI) {
        element.body.link.setAttribute('href', place.googleMapsURI);
    }

    element.info.desc.innerHTML = place.editorialSummary || 'No description';
    element.info.types.innerHTML = place.types.filter((type) => type !== 'point_of_interest' && type !== 'establishment' && type !== 'food').map((type) => type.substring(0, 1).toUpperCase() + type.substring(1).replaceAll('_', ' ')).join(', ');
    element.info.price.innerHTML = priceText;
    element.info.payment.innerHTML = paymentMethods.substring(0, paymentMethods.length - 2);

    insertSymbol(element.info.grid.breakfast, place.servesBreakfast);
    insertSymbol(element.info.grid.brunch, place.servesBrunch);
    insertSymbol(element.info.grid.lunch, place.servesLunch);
    insertSymbol(element.info.grid.dinner, place.servesDinner);
    insertSymbol(element.info.grid.cocktails, place.servesCocktails);
    insertSymbol(element.info.grid.dineIn, place.hasDineIn);
    insertSymbol(element.info.grid.reserve, place.isReservable);
    insertSymbol(element.info.grid.takeout, place.hasTakeout);
    insertSymbol(element.info.grid.deliver, place.hasDelivery);
    insertSymbol(element.info.grid.pickup, place.hasCurbsidePickup);

    element.contact.phone.innerHTML = 'Phone: ' + place.nationalPhoneNumber || 'None';
    element.contact.website.innerHTML = place.websiteURI || 'None';
    if (place.websiteURI) {
        element.contact.website.setAttribute('href', place.websiteURI);
    }
    place.regularOpeningHours.weekdayDescriptions.forEach((weekday) => {
        const li = document.createElement('li');
        li.innerHTML = weekday;
        element.contact.hours.appendChild(li);
    });

    place.reviews.forEach((review) => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'w-full flex flex-col gap-2';
        reviewElement.innerHTML = `
            <hr class="border-neutral" />
            <div class="w-full flex flex-row justify-start gap-2">
                <div class="avatar w-16 grow-0 shrink-0">
                    <div class="w-16 rounded-none">
                        <img alt="Author" src="${review.authorAttribution?.photoURI}" />
                    </div>
                </div>
                <div class="flex flex-col justify-center">
                    <a class="grow-0" href="${review.authorAttribution?.uri}">${review.authorAttribution?.displayName || 'Anonymous'}</a>
                    <span class="flex flex-row gap-1">${review.rating ? star.outerHTML.repeat(Math.round(review.rating)) : ''}</span>
                    <small class="grow-0">${review.relativePublishTimeDescription}</small>
                </div>
            </div>
            <p class="text">${review.text}</p>
        `.trim();
        element.reviews.appendChild(reviewElement);
    })

    hideSkeletons();
}

function showDetails(place) {
    if (details) {
        gsap.to(element.base, {
            xPercent: 120,
            duration: 0.25,
            ease: 'power1.in',
            onComplete: () => {
                getDetails(place);
                gsap.to(element.base, { xPercent: 0, duration: 0.25, ease: 'power1.out' });
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
                gsap.set(element.base, { xPercent: 0 });
                gsap.from(element.base, { xPercent: 120, duration: 0.25, ease: 'power1.out' });
            }
        });
    } else if (showFavorites) {
        gsap.to('#favorites', {
            xPercent: 120,
            duration: 0.25,
            ease: 'power1.in',
            onComplete: () => {
                getDetails(place);
                details = true;
                gsap.set(element.base, { xPercent: 0 });
                gsap.from(element.base, { xPercent: 120, duration: 0.25, ease: 'power1.out' });
            }
        });
    } else {
        getDetails(place);
        details = true;
        gsap.set(element.base, { xPercent: 0 });
        gsap.from(element.base, { xPercent: 120, duration: 0.25, ease: 'power1.out' });
    }
}

function hideDetails(target) {
    if (details) {
        details = false;
        gsap.to(element.base, {
            xPercent: 120,
            duration: 0.25,
            ease: 'power1.in',
            onComplete: () => {
                if (showSearch || showFavorites) {
                    gsap.set(target, { xPercent: 0 });
                    gsap.from(target, { xPercent: 120, duration: 0.25, ease: 'power1.out' });
                }
            }
        });
    }
}
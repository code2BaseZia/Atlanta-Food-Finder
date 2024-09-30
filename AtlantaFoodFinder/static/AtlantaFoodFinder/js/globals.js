let userPos;
let Place, SearchByTextRankPreference, SearchNearbyRankPreference;
let showSearch = false;
let details = false;
let restaurants;

const star = document.getElementById('star').cloneNode(true);
star.setAttribute('class', 'feather-sm fill-accent');
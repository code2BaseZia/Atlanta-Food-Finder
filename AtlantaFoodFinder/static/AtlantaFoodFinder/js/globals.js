let userPos;
let Place, SearchByTextRankPreference, SearchNearbyRankPreference, BusinessStatus, PriceLevel;
let showSearch = false;
let details = false;
let restaurants;

const star = document.getElementById('star').cloneNode(true);
star.setAttribute('class', 'feather-sm fill-accent');

const check = document.getElementById('check').cloneNode(true);
check.classList.remove('hidden');
const x = document.getElementById('x').cloneNode(true);
x.classList.remove('hidden');
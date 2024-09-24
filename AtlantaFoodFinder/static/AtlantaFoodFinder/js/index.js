const control = document.getElementById('menuControl');
console.log(control);

control.addEventListener('change', (e) => {
    if (e.target.checked) {
        gsap.to('#menu', { height: 'calc(100vh - 4rem)', duration: 0.25 })
    } else {
        gsap.to('#menu', { height: '0', duration: 0.25 })
    }
});

let showSearch = false;
gsap.set('#search', { xPercent: 120 });

toggleSearch = () => {
    showSearch = !showSearch;
    if (showSearch) {
        gsap.set('#search', { xPercent: 0 });
        gsap.from('#search', { xPercent: 120, duration: 0.25, ease: 'power1.out' });
    } else {
        gsap.to('#search', { xPercent: 120, duration: 0.25, ease: 'power1.in' });
    }
}
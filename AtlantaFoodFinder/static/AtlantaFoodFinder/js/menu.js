const control = document.getElementById('menuControl');

control.addEventListener('change', (e) => {
    if (e.target.checked) {
        gsap.to('#menu', { height: 'calc(100vh - 4rem)', duration: 0.25 })
    } else {
        gsap.to('#menu', { height: '0', duration: 0.25 })
    }
});
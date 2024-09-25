let details = false;

gsap.set('#details', { xPercent: 120 });

function showDetails() {
    details = true;
    gsap.set('#details', { xPercent: 0 });
    gsap.from('#details', { xPercent: 120, duration: 0.25, ease: 'power1.out' });
}

function hideDetails() {
    details = false;
    gsap.to('#details', { xPercent: 120, duration: 0.25, ease: 'power1.in' });
}
const loading = document.getElementById('loading');

function showLoading() {
    loading.classList.remove('hidden');
    loading.classList.add('flex');

    gsap.set(loading, { opacity: 1, y: 0, scale: 1 });
    gsap.from(loading, { opacity: 0, y: 25, scale: 0.8, ease: 'power2.out' });
}

function hideLoading() {
    gsap.to(loading, {
        opacity: 0,
        y: 25,
        scale: 0.8,
        height: 0,
        ease: 'power2.in',
        onComplete: () => {
            loading.classList.remove('flex');
            loading.classList.add('hidden');
        }
    });
}
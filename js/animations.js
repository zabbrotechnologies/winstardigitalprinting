/* js/animations.js - Scroll Reveal, Parallax & Interactive Effects */

export function initScrollAnimations() {
    // Scroll Reveal Observer
    const reveals = document.querySelectorAll('.reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => revealObserver.observe(el));
}

export function initCustomCursor() {
    // Custom cursor removed per user preference - default browser cursor restored
}

export function animateCounter(element, targetVal, duration = 600) {
    if (!element) return;
    const startVal = parseFloat(element.dataset.val || '0');
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = startVal + (targetVal - startVal) * (1 - Math.pow(1 - progress, 3));
        element.textContent = '₹' + current.toFixed(2);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = '₹' + targetVal.toFixed(2);
            element.dataset.val = targetVal;
        }
    }
    requestAnimationFrame(update);
}

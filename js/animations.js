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
    if (window.innerWidth < 1024) return; // Desktop only

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const follower = document.createElement('div');
    follower.className = 'custom-cursor-follower';

    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    function animateFollower() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover state over interactive elements
    const clickables = document.querySelectorAll('a, button, .glass-card, .toggle-btn, .binding-card');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-active');
            follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-active');
            follower.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
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

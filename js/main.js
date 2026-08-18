// main.js
import { getStore, formatCurrency } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize custom cursor on desktop
    initCustomCursor();

    // 2. Initialize Navigation (scrolled state & mobile menu)
    initNavigation();

    // 3. Update Cart Count
    updateCartCount();
    window.addEventListener('store_updated', updateCartCount);

    // 4. Handle smooth page transitions
    initPageTransitions();
});

function initCustomCursor() {
    // Only on desktop
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    // CSS for cursor added dynamically to avoid cluttering main css if it fails
    Object.assign(cursor.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '12px',
        height: '12px',
        backgroundColor: 'var(--color-accent)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '999999',
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.2s, height 0.2s, background-color 0.2s',
        mixBlendMode: 'difference'
    });

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Interactive elements
    const interactives = document.querySelectorAll('a, button, .upload-zone, .selector-item');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '24px';
            cursor.style.height = '24px';
            cursor.style.backgroundColor = 'var(--color-white)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '12px';
            cursor.style.height = '12px';
            cursor.style.backgroundColor = 'var(--color-accent)';
        });
    });
}

function initNavigation() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            // basic inline style toggle for mobile
            if (navLinks.style.display === 'flex') {
                Object.assign(navLinks.style, {
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    width: '100%',
                    flexDirection: 'column',
                    backgroundColor: 'var(--color-primary)',
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--color-border)'
                });
            } else {
                navLinks.style = ''; // reset
            }
        });
    }
}

function updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    if (countElements.length > 0) {
        const store = getStore();
        const count = store.cart.length;
        countElements.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }
}

function initPageTransitions() {
    // Create overlay if it doesn't exist
    if (!document.querySelector('.page-transition-overlay')) {
        const overlay = document.createElement('div');
        overlay.classList.add('page-transition-overlay');
        document.body.appendChild(overlay);
    }

    // Fade out on load
    setTimeout(() => {
        document.body.classList.remove('page-transition-active');
    }, 100);

    // Handle internal links
    const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="http"]:not([target="_blank"])');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Skip hash links or external
            if (href.startsWith('#') || href.includes('javascript:')) return;
            
            e.preventDefault();
            document.body.classList.add('page-transition-active');
            
            setTimeout(() => {
                window.location.href = href;
            }, 600); // match var(--transition-slow)
        });
    });
}

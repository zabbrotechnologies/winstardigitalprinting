/* js/app.js - Main Application Initializer & UI Controller */
import { WINSTAR_CONFIG } from './config.js';
import { Auth } from './auth.js';
import { Cart } from './cart.js';
import { initScrollAnimations, initCustomCursor } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Sticky Header & Glass effect on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            mobileToggle.classList.toggle('active');
        });
    }

    // 3. Highlight Active Nav Link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 4. Update Header User Profile / Login Link
    const navAuthContainer = document.querySelector('.nav-auth');
    if (navAuthContainer) {
        const user = Auth.getUser();
        if (user) {
            navAuthContainer.innerHTML = `
                <a href="dashboard.html" class="btn btn-outline btn-sm" style="border-color: var(--winstar-yellow); color: var(--winstar-yellow);">
                    👤 ${user.companyName || user.name}
                </a>
            `;
        } else {
            navAuthContainer.innerHTML = `
                <a href="login.html" class="nav-link">Login</a>
            `;
        }
    }

    // 5. Update WhatsApp links across the site with primary config
    const waButtons = document.querySelectorAll('.js-whatsapp-link');
    waButtons.forEach(btn => {
        btn.setAttribute('href', `https://wa.me/${WINSTAR_CONFIG.primaryWhatsapp}`);
    });

    // 6. Update Contact Phones across site
    const phoneElems = document.querySelectorAll('.js-phone-primary');
    phoneElems.forEach(el => el.textContent = WINSTAR_CONFIG.additionalPhone1);

    // 7. Boot Scroll Animations
    initScrollAnimations();
    Cart.updateBadge();
});

/**
 * Toast Notification Helper
 */
export function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span>${type === 'success' ? '✨' : 'ℹ️'}</span>
        <div>${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

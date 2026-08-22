/* js/app.js - Global App Initializer & Toast Notifications */
import { initNavbar } from './navbar.js';
import { WINSTAR_CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();

    // Dynamically populate WhatsApp links across the site
    document.querySelectorAll('.js-whatsapp-link').forEach(link => {
        link.setAttribute('href', `https://wa.me/${WINSTAR_CONFIG.primaryWhatsapp}`);
    });

    // Populate contact phones
    document.querySelectorAll('.js-phone-primary').forEach(el => {
        el.textContent = WINSTAR_CONFIG.primaryWhatsapp;
    });
});

/**
 * Global Toast Notification System
 */
export function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✨' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
        <div>${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

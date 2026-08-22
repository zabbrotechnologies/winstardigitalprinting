/* js/navbar.js - Dynamic Navbar Behavior & Active State Management */
import { Auth } from './auth.js';
import { WINSTAR_CONFIG } from './config.js';

export function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Active Nav Link Highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update Auth Link & Actions
    const navAuthContainer = document.querySelector('.nav-auth');
    const user = Auth.getUser();

    if (navAuthContainer) {
        if (user) {
            if (user.role === 'admin') {
                navAuthContainer.innerHTML = `
                    <a href="admin.html" class="btn btn-outline-yellow btn-sm">ADMIN PORTAL</a>
                    <button id="logoutBtn" class="btn btn-outline btn-sm" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Logout</button>
                `;
            } else if (user.role === 'wholesale') {
                navAuthContainer.innerHTML = `
                    <a href="bulk-order.html" class="btn btn-outline-yellow btn-sm">${user.companyName || user.name}</a>
                    <button id="logoutBtn" class="btn btn-outline btn-sm" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Logout</button>
                `;
            }
            
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => Auth.logout());
            }
        } else {
            navAuthContainer.innerHTML = `
                <a href="login.html" class="nav-link">Login</a>
            `;
        }
    }

    // Mobile Hamburger Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            mobileToggle.classList.toggle('active');
        });
    }
}

document.addEventListener('DOMContentLoaded', initNavbar);

/* js/services.js - Services Catalog & Landing Preview Renderer */
import { SERVICES_CONFIG } from './services-data.js';

export function renderServicesPreview(containerId, limit = 8) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const keys = Object.keys(SERVICES_CONFIG).slice(0, limit);
    container.innerHTML = keys.map(key => {
        const s = SERVICES_CONFIG[key];
        return `
            <div class="service-card">
                <div class="service-card-img-wrapper">
                    <img src="${s.image}" alt="${s.name}" class="service-card-img">
                    <div class="service-card-overlay"></div>
                </div>
                <div class="service-card-content">
                    <div class="service-card-icon">${s.icon}</div>
                    <h3 class="service-card-title">${s.name}</h3>
                    <p class="service-card-desc">${s.shortDesc}</p>
                    <div class="service-card-footer">
                        <span class="service-card-price-tag">Custom Specs</span>
                        <a href="service.html?service=${s.id}" class="btn btn-gradient btn-sm">Order Now &rarr;</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

export function renderFullServicesCatalog(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const keys = Object.keys(SERVICES_CONFIG);
    container.innerHTML = keys.map(key => {
        const s = SERVICES_CONFIG[key];
        return `
            <div class="service-card" data-category="${s.category}">
                <div class="service-card-img-wrapper">
                    <img src="${s.image}" alt="${s.name}" class="service-card-img">
                    <div class="service-card-overlay"></div>
                    <span class="badge badge-yellow service-card-badge">${s.category.toUpperCase()}</span>
                </div>
                <div class="service-card-content">
                    <div class="service-card-icon">${s.icon}</div>
                    <h3 class="service-card-title">${s.name}</h3>
                    <p class="service-card-desc">${s.description}</p>
                    <div class="service-card-footer">
                        <span class="service-card-price-tag">High Quality</span>
                        <a href="service.html?service=${s.id}" class="btn btn-gradient btn-sm">Order Now &rarr;</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

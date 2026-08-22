/* js/service-order.js - Reusable Dynamic Service Order Configurator Engine */
import { SERVICES_CONFIG } from './services-data.js';
import { calculatePrice } from './pricing.js';
import { Auth } from './auth.js';
import { SupabaseClient } from './supabase.js';
import { WhatsAppOrder } from './whatsapp.js';
import { showToast } from './app.js';

let selectedFile = null;
let currentService = null;
let currentServiceId = null;

export function initServiceOrderPage() {
    const urlParams = new URLSearchParams(window.location.search);
    currentServiceId = urlParams.get('service') || 'business-cards';
    currentService = SERVICES_CONFIG[currentServiceId] || SERVICES_CONFIG['business-cards'];

    renderHeader();
    renderDynamicForm();
    initDropzone();
    initPriceCalculator();

    const form = document.getElementById('serviceOrderForm');
    if (form) {
        form.addEventListener('submit', handleOrderSubmit);
    }
}

function renderHeader() {
    const iconEl = document.getElementById('serviceHeaderIcon');
    const titleEl = document.getElementById('serviceHeaderTitle');
    const descEl = document.getElementById('serviceHeaderDesc');

    if (iconEl) iconEl.textContent = currentService.icon;
    if (titleEl) titleEl.textContent = currentService.name;
    if (descEl) descEl.textContent = currentService.description;
}

function renderDynamicForm() {
    const container = document.getElementById('dynamicFieldsContainer');
    if (!container) return;

    container.innerHTML = currentService.fields.map(field => {
        if (field.type === 'select') {
            return `
                <div class="form-group">
                    <label class="form-label" for="${field.id}">${field.label}</label>
                    <select class="form-select js-calc-input" id="${field.id}" name="${field.id}">
                        ${field.options.map(opt => `
                            <option value="${opt.value}" ${opt.value === field.default ? 'selected' : ''}>${opt.label}</option>
                        `).join('')}
                    </select>
                </div>
            `;
        } else if (field.type === 'number') {
            return `
                <div class="form-group">
                    <label class="form-label" for="${field.id}">${field.label}</label>
                    <input type="number" class="form-input js-calc-input" id="${field.id}" name="${field.id}" 
                           min="${field.min || 1}" step="${field.step || 1}" value="${field.default || 1}">
                </div>
            `;
        }
        return '';
    }).join('');
}

function initDropzone() {
    const dropzone = document.getElementById('uploadDropzone');
    const fileInput = document.getElementById('fileInput');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    });
}

function handleFileSelection(file) {
    if (file.size > 50 * 1024 * 1024) {
        showToast('File size exceeds maximum 50MB limit.', 'error');
        return;
    }

    selectedFile = file;
    const previewContainer = document.getElementById('filePreviewContainer');
    if (previewContainer) {
        previewContainer.innerHTML = `
            <div class="file-preview-card">
                <div class="file-preview-info">
                    <span class="file-preview-icon">📄</span>
                    <div>
                        <div class="file-preview-name">${file.name}</div>
                        <div class="file-preview-size">${(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                </div>
                <button type="button" class="file-remove-btn" id="removeFileBtn">&times;</button>
            </div>
        `;

        document.getElementById('removeFileBtn')?.addEventListener('click', () => {
            selectedFile = null;
            previewContainer.innerHTML = '';
            const input = document.getElementById('fileInput');
            if (input) input.value = '';
        });
    }
}

function initPriceCalculator() {
    const calcInputs = document.querySelectorAll('.js-calc-input');
    calcInputs.forEach(input => {
        input.addEventListener('change', updatePriceSummary);
        input.addEventListener('input', updatePriceSummary);
    });

    updatePriceSummary();
}

function getFormOptions() {
    const options = {};
    if (!currentService) return options;

    currentService.fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            options[field.id] = input.value;
        }
    });

    const notesInput = document.getElementById('orderNotes');
    if (notesInput) {
        options.instructions = notesInput.value;
    }

    return options;
}

function updatePriceSummary() {
    const options = getFormOptions();
    const isWholesale = Auth.isWholesale();
    const pricing = calculatePrice(options, currentServiceId, isWholesale ? 'wholesale' : 'normal');

    const subtotalEl = document.getElementById('summarySubtotal');
    const gstEl = document.getElementById('summaryGst');
    const totalEl = document.getElementById('summaryTotal');
    const wholesaleBadge = document.getElementById('summaryWholesaleBadge');

    if (subtotalEl) subtotalEl.textContent = '₹' + pricing.subtotal;
    if (gstEl) gstEl.textContent = '₹' + pricing.gst;
    if (totalEl) totalEl.textContent = '₹' + pricing.total;

    if (wholesaleBadge) {
        wholesaleBadge.style.display = isWholesale ? 'inline-flex' : 'none';
    }
}

async function handleOrderSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');

    if (!nameInput.value.trim()) {
        showToast('Please enter your name.', 'error');
        return;
    }

    if (!phoneInput.value.trim() || phoneInput.value.trim().length < 10) {
        showToast('Please enter a valid mobile number.', 'error');
        return;
    }

    // Default to sample document if user has not picked a file yet
    const uploadFile = selectedFile || {
        name: `${currentServiceId}_design.pdf`,
        size: 1542000,
        type: 'application/pdf'
    };

    const submitBtn = document.getElementById('submitOrderBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating Order Request...';
    }

    try {
        const options = getFormOptions();
        const isWholesale = Auth.isWholesale();
        const pricing = calculatePrice(options, currentServiceId, isWholesale ? 'wholesale' : 'normal');
        const user = Auth.getUser();

        const orderData = {
            customerName: nameInput.value.trim(),
            customerPhone: phoneInput.value.trim(),
            serviceId: currentServiceId,
            serviceName: currentService.name,
            options: options,
            quantity: options.quantity || 1,
            total: pricing.total,
            userType: isWholesale ? 'wholesale' : 'normal',
            userId: user ? user.id : null
        };

        const createdOrder = await SupabaseClient.createOrder(orderData, uploadFile);

        openConfirmationModal(createdOrder);

    } catch (err) {
        showToast('Failed to create order. Please try again.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'SUBMIT PRINT ORDER & OPEN WHATSAPP';
        }
    }
}

function openConfirmationModal(order) {
    const modal = document.getElementById('orderModal');
    const body = document.getElementById('orderModalBody');
    const waBtn = document.getElementById('modalWhatsAppBtn');

    if (!modal || !body) return;

    const formattedWaMsg = WhatsAppOrder.formatMessage(order);
    const waUrl = WhatsAppOrder.getWhatsAppUrl(formattedWaMsg);

    body.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">✅</div>
            <h2 style="color: #FFF; font-size: 1.75rem;">ORDER DETAILS READY</h2>
            <p style="color: var(--winstar-yellow); font-size: 1.1rem; font-weight: 800; margin-top: 0.25rem;">
                REQUEST ID: ${order.requestId}
            </p>
        </div>

        <div style="background: rgba(0,0,0,0.4); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; font-size: 0.9rem; color: #FFF;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--color-text-muted);">Customer:</span>
                <strong>${order.customerName} (${order.customerPhone})</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--color-text-muted);">Service:</span>
                <strong>${order.serviceName}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--color-text-muted);">File Uploaded:</span>
                <strong>${order.fileName}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem; margin-top: 0.5rem;">
                <span style="color: var(--color-text-muted);">Estimated Total:</span>
                <strong style="color: var(--winstar-yellow); font-size: 1.2rem;">₹${order.amount}</strong>
            </div>
        </div>
    `;

    if (waBtn) {
        waBtn.setAttribute('href', waUrl);
        waBtn.setAttribute('target', '_blank');
    }

    modal.classList.add('active');
}

document.addEventListener('DOMContentLoaded', initServiceOrderPage);

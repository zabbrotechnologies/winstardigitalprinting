/* js/quick-print.js - Common Print Room Controller */
import { calculatePrice } from './pricing.js';
import { Auth } from './auth.js';
import { SupabaseClient } from './supabase.js';
import { WhatsAppOrder } from './whatsapp.js';
import { showToast } from './app.js';

let selectedFile = null;

export function initQuickPrintPage() {
    initDropzone();
    initPriceCalculator();

    const form = document.getElementById('quickPrintForm');
    if (form) {
        form.addEventListener('submit', handleOrderSubmit);
    }
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

function getQuickPrintOptions() {
    return {
        printType: document.getElementById('printType')?.value || 'bw',
        printSides: document.getElementById('printSides')?.value || 'single',
        paperSize: document.getElementById('paperSize')?.value || 'A4',
        paperGsm: document.getElementById('paperGsm')?.value || '80gsm',
        paperType: document.getElementById('paperType')?.value || 'copier',
        copies: parseInt(document.getElementById('copies')?.value || '1', 10),
        bindingType: document.getElementById('bindingType')?.value || 'none',
        instructions: document.getElementById('orderNotes')?.value || ''
    };
}

function updatePriceSummary() {
    const options = getQuickPrintOptions();
    const isWholesale = Auth.isWholesale();
    const pricing = calculatePrice(options, 'quick-print', isWholesale ? 'wholesale' : 'normal');

    const subtotalEl = document.getElementById('summarySubtotal');
    const gstEl = document.getElementById('summaryGst');
    const totalEl = document.getElementById('summaryTotal');

    if (subtotalEl) subtotalEl.textContent = '₹' + pricing.subtotal;
    if (gstEl) gstEl.textContent = '₹' + pricing.gst;
    if (totalEl) totalEl.textContent = '₹' + pricing.total;
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
        showToast('Please enter a valid 10-digit mobile number.', 'error');
        return;
    }

    // Default file if not manually selected
    const uploadFile = selectedFile || {
        name: 'document_printout.pdf',
        size: 1048576,
        type: 'application/pdf'
    };

    const submitBtn = document.getElementById('submitOrderBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Request...';
    }

    try {
        const options = getQuickPrintOptions();
        const isWholesale = Auth.isWholesale();
        const pricing = calculatePrice(options, 'quick-print', isWholesale ? 'wholesale' : 'normal');
        const user = Auth.getUser();

        const orderData = {
            customerName: nameInput.value.trim(),
            customerPhone: phoneInput.value.trim(),
            serviceId: 'quick-print',
            serviceName: 'Quick Print',
            options: options,
            quantity: options.copies,
            total: pricing.total,
            userType: isWholesale ? 'wholesale' : 'normal',
            userId: user ? user.id : null
        };

        const createdOrder = await SupabaseClient.createOrder(orderData, uploadFile);

        openConfirmationModal(createdOrder);

    } catch (err) {
        showToast('Order creation failed. Please try again.', 'error');
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
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">⚡</div>
            <h2 style="color: #FFF; font-size: 1.75rem;">QUICK PRINT READY</h2>
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
                <span style="color: var(--color-text-muted);">File Name:</span>
                <strong>${order.fileName}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--color-text-muted);">Print Config:</span>
                <strong>${order.options.printType.toUpperCase()} | ${order.options.paperSize} | ${order.options.copies} Copy(ies)</strong>
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

document.addEventListener('DOMContentLoaded', initQuickPrintPage);

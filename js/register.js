/* js/register.js - Wholesale Agency Registration Handler */
import { SupabaseClient } from './supabase.js';
import { showToast } from './app.js';

let visitingCardFile = null;
let proofFile = null;

export function initRegisterPage() {
    const cardInput = document.getElementById('visitingCardInput');
    const proofInput = document.getElementById('businessProofInput');

    if (cardInput) {
        cardInput.addEventListener('change', (e) => {
            if (e.target.files[0]) visitingCardFile = e.target.files[0];
        });
    }

    if (proofInput) {
        proofInput.addEventListener('change', (e) => {
            if (e.target.files[0]) proofFile = e.target.files[0];
        });
    }

    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', handleRegistration);
    }
}

async function handleRegistration(e) {
    e.preventDefault();

    const name = document.getElementById('applicantName')?.value.trim();
    const phone = document.getElementById('applicantPhone')?.value.trim();
    const email = document.getElementById('applicantEmail')?.value.trim();
    const password = document.getElementById('applicantPassword')?.value;
    const companyName = document.getElementById('companyName')?.value.trim();
    const gstNumber = document.getElementById('gstNumber')?.value.trim();
    const address = document.getElementById('businessAddress')?.value.trim();

    if (!name || !phone || !email || !password || !companyName || !address) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (!visitingCardFile || !proofFile) {
        showToast('Please upload both your Visiting Card and Business Proof document.', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitRegBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Application...';
    }

    try {
        const appData = { name, phone, email, password, companyName, gstNumber, address };
        await SupabaseClient.submitWholesaleApplication(appData, visitingCardFile, proofFile);

        showRegistrationSuccessModal();

    } catch (err) {
        showToast('Registration failed. Please try again.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'APPLY FOR WHOLESALE';
        }
    }
}

function showRegistrationSuccessModal() {
    const modal = document.getElementById('regModal');
    if (modal) {
        modal.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', initRegisterPage);

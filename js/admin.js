/* js/admin.js - Admin Management Dashboard Controller */
import { Auth } from './auth.js';
import { SupabaseClient } from './supabase.js';
import { showToast } from './app.js';

export async function initAdminPage() {
    // Access Guard
    if (!Auth.isAdmin()) {
        showToast('Unauthorized access. Admin login required.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
        return;
    }

    initTabs();
    await refreshAdminDashboard();

    // Event listeners for search inputs
    const normalSearch = document.getElementById('normalOrdersSearch');
    if (normalSearch) normalSearch.addEventListener('input', () => renderNormalOrdersTable());

    const wholesaleSearch = document.getElementById('wholesaleOrdersSearch');
    if (wholesaleSearch) wholesaleSearch.addEventListener('input', () => renderWholesaleOrdersTable());
}

function initTabs() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.classList.add('active');
        });
    });
}

async function refreshAdminDashboard() {
    const allOrders = await SupabaseClient.fetchOrders('all');
    const normalOrders = allOrders.filter(o => o.userType === 'normal');
    const wholesaleOrders = allOrders.filter(o => o.userType === 'wholesale');
    const applications = await SupabaseClient.fetchWholesaleApplications();
    const pendingApps = applications.filter(a => a.status === 'pending');

    // Update Stats Cards
    const normalCountEl = document.getElementById('statNormalOrdersCount');
    const wholesaleCountEl = document.getElementById('statWholesaleOrdersCount');
    const pendingVerifEl = document.getElementById('statPendingVerifCount');

    if (normalCountEl) normalCountEl.textContent = normalOrders.length;
    if (wholesaleCountEl) wholesaleCountEl.textContent = wholesaleOrders.length;
    if (pendingVerifEl) pendingVerifEl.textContent = pendingApps.length;

    renderNormalOrdersTable(normalOrders);
    renderWholesaleOrdersTable(wholesaleOrders);
    renderAgencyVerificationTable(applications);
}

async function renderNormalOrdersTable(orders = null) {
    if (!orders) orders = await SupabaseClient.fetchOrders('normal');
    const container = document.getElementById('normalOrdersTableBody');
    const searchVal = (document.getElementById('normalOrdersSearch')?.value || '').toLowerCase();

    if (!container) return;

    const filtered = orders.filter(o => 
        (o.requestId && o.requestId.toLowerCase().includes(searchVal)) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchVal)) ||
        (o.customerPhone && o.customerPhone.includes(searchVal))
    );

    if (filtered.length === 0) {
        container.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--color-text-muted); padding: 2rem;">No normal print orders found.</td></tr>`;
        return;
    }

    container.innerHTML = filtered.map(o => `
        <tr>
            <td><strong>${o.requestId}</strong></td>
            <td>${o.customerName}</td>
            <td>${o.customerPhone}</td>
            <td>${o.serviceName}</td>
            <td>${o.fileName}</td>
            <td>${o.quantity}</td>
            <td style="color: var(--winstar-yellow); font-weight: 700;">₹${o.amount}</td>
            <td>${new Date(o.createdAt).toLocaleDateString()}</td>
            <td>
                <select class="form-select status-select" data-id="${o.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="printing" ${o.status === 'printing' ? 'selected' : ''}>Printing</option>
                    <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>Ready for Pickup</option>
                    <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="btn btn-outline btn-sm view-order-btn" data-id="${o.id}">VIEW</button>
                    <button class="btn btn-gradient btn-sm download-file-btn" data-file="${o.fileName}" data-req="${o.requestId}">DOWNLOAD</button>
                </div>
            </td>
        </tr>
    `).join('');

    bindTableActionEvents();
}

async function renderWholesaleOrdersTable(orders = null) {
    if (!orders) orders = await SupabaseClient.fetchOrders('wholesale');
    const container = document.getElementById('wholesaleOrdersTableBody');
    const searchVal = (document.getElementById('wholesaleOrdersSearch')?.value || '').toLowerCase();

    if (!container) return;

    const filtered = orders.filter(o => 
        (o.requestId && o.requestId.toLowerCase().includes(searchVal)) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchVal))
    );

    if (filtered.length === 0) {
        container.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--color-text-muted); padding: 2rem;">No wholesale orders found.</td></tr>`;
        return;
    }

    container.innerHTML = filtered.map(o => `
        <tr>
            <td><strong>${o.requestId}</strong></td>
            <td>${o.customerName}</td>
            <td>${o.customerPhone}</td>
            <td>${o.serviceName}</td>
            <td>${o.fileName}</td>
            <td>${o.quantity}</td>
            <td style="color: var(--winstar-yellow); font-weight: 700;">₹${o.amount}</td>
            <td>Store Pickup / Courier</td>
            <td>${new Date(o.createdAt).toLocaleDateString()}</td>
            <td>
                <select class="form-select status-select" data-id="${o.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="printing" ${o.status === 'printing' ? 'selected' : ''}>Printing</option>
                    <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="btn btn-outline btn-sm view-order-btn" data-id="${o.id}">VIEW</button>
                    <button class="btn btn-gradient btn-sm download-file-btn" data-file="${o.fileName}" data-req="${o.requestId}">DOWNLOAD</button>
                </div>
            </td>
        </tr>
    `).join('');

    bindTableActionEvents();
}

async function renderAgencyVerificationTable(applications = null) {
    if (!applications) applications = await SupabaseClient.fetchWholesaleApplications();
    const container = document.getElementById('agencyVerificationTableBody');

    if (!container) return;

    if (applications.length === 0) {
        container.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted); padding: 2rem;">No wholesale agency applications pending.</td></tr>`;
        return;
    }

    container.innerHTML = applications.map(a => `
        <tr>
            <td><strong>${a.companyName}</strong></td>
            <td>${a.applicantName}</td>
            <td>${a.phone}</td>
            <td>${a.email}</td>
            <td>${new Date(a.submittedAt).toLocaleDateString()}</td>
            <td>
                <span class="badge ${a.status === 'approved' ? 'badge-success' : a.status === 'pending' ? 'badge-pending' : 'badge-brand'}">
                    ${a.status.toUpperCase()}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="btn btn-outline btn-sm view-app-btn" data-id="${a.id}">VIEW DOCS</button>
                    ${a.status === 'pending' ? `
                        <button class="btn btn-gradient btn-sm approve-app-btn" data-id="${a.id}">APPROVE</button>
                        <button class="btn btn-outline btn-sm reject-app-btn" data-id="${a.id}" style="border-color: var(--color-error); color: var(--color-error);">REJECT</button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    bindAgencyActionEvents();
}

function bindTableActionEvents() {
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const orderId = e.target.dataset.id;
            const newStatus = e.target.value;
            await SupabaseClient.updateOrderStatus(orderId, newStatus);
            showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
        });
    });

    document.querySelectorAll('.download-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fileName = e.target.dataset.file;
            const reqId = e.target.dataset.req;
            triggerFileDownload(fileName, reqId);
        });
    });
}

function bindAgencyActionEvents() {
    document.querySelectorAll('.approve-app-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const appId = e.target.dataset.id;
            await SupabaseClient.updateApplicationStatus(appId, 'approved');
            showToast('Agency Wholesale Application Approved!', 'success');
            refreshAdminDashboard();
        });
    });

    document.querySelectorAll('.reject-app-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const appId = e.target.dataset.id;
            await SupabaseClient.updateApplicationStatus(appId, 'rejected');
            showToast('Agency Application Rejected.', 'info');
            refreshAdminDashboard();
        });
    });
}

function triggerFileDownload(fileName, reqId) {
    const dummyContent = `WINSTAR DIGITAL PRINTING & XEROX\nFile Download for Request ID: ${reqId}\nFile Name: ${fileName}\nProcessed via Admin Portal`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reqId}_${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloading file: ${fileName}`, 'success');
}

document.addEventListener('DOMContentLoaded', initAdminPage);

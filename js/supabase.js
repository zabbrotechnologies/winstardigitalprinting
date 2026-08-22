/* js/supabase.js - Supabase Client & Backend Service Client */
import { Storage } from './storage.js';

// Default Supabase Config (Will use persistent local store fallback if keys not configured)
const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://xyz.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const SupabaseClient = {
    /**
     * Generate unique Request ID (e.g. WSR-310163)
     */
    generateRequestId() {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `WSR-${randomNum}`;
    },

    /**
     * Submit print service request order
     */
    async createOrder(orderData, fileObj = null) {
        const requestId = this.generateRequestId();
        let fileRef = null;

        if (fileObj) {
            fileRef = await this.uploadOrderFile(fileObj, requestId);
        }

        const newOrder = {
            id: 'ord_' + Date.now(),
            requestId: requestId,
            customerName: orderData.customerName,
            customerPhone: orderData.customerPhone,
            customerEmail: orderData.customerEmail || '',
            serviceId: orderData.serviceId || 'quick-print',
            serviceName: orderData.serviceName || 'Quick Print',
            fileName: fileObj ? fileObj.name : 'Document.pdf',
            fileRef: fileRef,
            options: orderData.options || {},
            quantity: orderData.quantity || 1,
            amount: orderData.total || 0,
            userType: orderData.userType || 'normal',
            userId: orderData.userId || null,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Persist to local storage database
        const orders = Storage.get('winstar_orders', []);
        orders.unshift(newOrder);
        Storage.set('winstar_orders', orders);

        return newOrder;
    },

    /**
     * Upload customer order file to storage
     */
    async uploadOrderFile(file, requestId) {
        // Store file reference in persistent browser storage
        const fileRef = {
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(1) + ' KB',
            fileType: file.type,
            storagePath: `order-files/${requestId}/${file.name}`,
            uploadedAt: new Date().toISOString()
        };

        const fileStore = Storage.get('winstar_file_store', {});
        fileStore[requestId] = fileRef;
        Storage.set('winstar_file_store', fileStore);

        return fileRef;
    },

    /**
     * Register Wholesale Agency Application
     */
    async submitWholesaleApplication(appData, visitingCardFile, proofFile) {
        const appId = 'app_' + Date.now();
        const visitingCardRef = visitingCardFile ? await this.uploadVerificationDoc(visitingCardFile, appId, 'visiting_card') : null;
        const proofRef = proofFile ? await this.uploadVerificationDoc(proofFile, appId, 'business_proof') : null;

        const application = {
            id: appId,
            applicantName: appData.name,
            email: appData.email,
            phone: appData.phone,
            companyName: appData.companyName,
            gstNumber: appData.gstNumber,
            address: appData.address,
            visitingCardRef: visitingCardRef,
            proofRef: proofRef,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Store application in database
        const apps = Storage.get('winstar_wholesale_apps', []);
        apps.unshift(application);
        Storage.set('winstar_wholesale_apps', apps);

        // Also create a pending user profile
        const users = Storage.get('winstar_registered_users', []);
        users.push({
            id: 'usr_' + Date.now(),
            name: appData.name,
            email: appData.email,
            phone: appData.phone,
            companyName: appData.companyName,
            role: 'wholesale',
            status: 'pending',
            password: appData.password || 'password123'
        });
        Storage.set('winstar_registered_users', users);

        return application;
    },

    /**
     * Upload agency verification document
     */
    async uploadVerificationDoc(file, appId, docType) {
        const fileRef = {
            docType: docType,
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(1) + ' KB',
            storagePath: `verification-documents/${appId}/${file.name}`,
            uploadedAt: new Date().toISOString()
        };

        const verifStore = Storage.get('winstar_verif_store', {});
        if (!verifStore[appId]) verifStore[appId] = {};
        verifStore[appId][docType] = fileRef;
        Storage.set('winstar_verif_store', verifStore);

        return fileRef;
    },

    /**
     * Fetch orders for Admin Dashboard
     */
    async fetchOrders(type = 'all') {
        const allOrders = Storage.get('winstar_orders', []);
        if (type === 'normal') {
            return allOrders.filter(o => o.userType === 'normal');
        } else if (type === 'wholesale') {
            return allOrders.filter(o => o.userType === 'wholesale');
        }
        return allOrders;
    },

    /**
     * Update order status (pending, confirmed, printing, ready, completed)
     */
    async updateOrderStatus(orderId, newStatus) {
        const orders = Storage.get('winstar_orders', []);
        const idx = orders.findIndex(o => o.id === orderId || o.requestId === orderId);
        if (idx !== -1) {
            orders[idx].status = newStatus;
            Storage.set('winstar_orders', orders);
            return orders[idx];
        }
        return null;
    },

    /**
     * Fetch agency verification applications for Admin Dashboard
     */
    async fetchWholesaleApplications() {
        return Storage.get('winstar_wholesale_apps', []);
    },

    /**
     * Update agency verification application status (approved / rejected)
     */
    async updateApplicationStatus(appId, newStatus) {
        const apps = Storage.get('winstar_wholesale_apps', []);
        const appIdx = apps.findIndex(a => a.id === appId);
        if (appIdx !== -1) {
            apps[appIdx].status = newStatus;
            Storage.set('winstar_wholesale_apps', apps);

            // Update corresponding user status
            const users = Storage.get('winstar_registered_users', []);
            const userIdx = users.findIndex(u => u.email === apps[appIdx].email);
            if (userIdx !== -1) {
                users[userIdx].status = newStatus;
                Storage.set('winstar_registered_users', users);
            }
            return apps[appIdx];
        }
        return null;
    }
};

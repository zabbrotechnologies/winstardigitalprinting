/* js/auth.js - Intelligent Role-Based Authentication Manager */
import { Storage } from './storage.js';
import { WINSTAR_CONFIG } from './config.js';

export const Auth = {
    /**
     * Default Admin Credentials Seed
     */
    initSeedAccounts() {
        const users = Storage.get('winstar_registered_users', []);
        // Seed default admin account if not present
        const hasAdmin = users.some(u => u.role === 'admin');
        if (!hasAdmin) {
            users.push({
                id: 'usr_admin_01',
                name: 'Winstar Administrator',
                email: 'admin@winstardigital.com',
                phone: '9345046665',
                role: 'admin',
                status: 'approved',
                password: 'admin' // Demo admin password
            });
            Storage.set('winstar_registered_users', users);
        }
    },

    /**
     * Intelligent Login for Admin and Wholesale Accounts
     */
    async login(email, password) {
        this.initSeedAccounts();
        const cleanEmail = email.trim().toLowerCase();
        const users = Storage.get('winstar_registered_users', []);

        const user = users.find(u => u.email.toLowerCase() === cleanEmail);

        if (!user) {
            return { success: false, message: 'Account not found. Please check your email or register for wholesale.' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Invalid password. Please try again.' };
        }

        // Role & Status Checks
        if (user.role === 'admin') {
            const session = { id: user.id, name: user.name, email: user.email, role: 'admin', status: 'approved' };
            Storage.set('winstar_session', session);
            return { success: true, user: session, redirect: 'admin.html' };
        }

        if (user.role === 'wholesale') {
            if (user.status === 'pending') {
                return { 
                    success: false, 
                    status: 'pending', 
                    message: 'YOUR ACCOUNT IS UNDER VERIFICATION. Our team will review your business credentials shortly.' 
                };
            }
            if (user.status === 'rejected') {
                return { 
                    success: false, 
                    status: 'rejected', 
                    message: 'YOUR WHOLESALE APPLICATION WAS NOT APPROVED. Please contact support for details.' 
                };
            }

            const session = { 
                id: user.id, 
                name: user.name, 
                companyName: user.companyName, 
                email: user.email, 
                role: 'wholesale', 
                status: 'approved' 
            };
            Storage.set('winstar_session', session);
            return { success: true, user: session, redirect: 'bulk-order.html' };
        }

        return { success: false, message: 'Unauthorized role.' };
    },

    /**
     * Get Current Authenticated Session
     */
    getUser() {
        return Storage.get('winstar_session', null);
    },

    /**
     * Check if active session is Admin
     */
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },

    /**
     * Check if active session is Approved Wholesale
     */
    isWholesale() {
        const user = this.getUser();
        return user && user.role === 'wholesale' && user.status === 'approved';
    },

    /**
     * Logout
     */
    logout() {
        Storage.remove('winstar_session');
        window.location.href = 'login.html';
    }
};

Auth.initSeedAccounts();

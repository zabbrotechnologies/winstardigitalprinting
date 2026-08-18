/* js/auth.js - Business & Wholesale Customer Authentication Manager (Supabase Connected) */
import { API } from './api.js';

export const Auth = {
    /**
     * Register a new business user
     */
    async signup(userData) {
        try {
            const res = await API.post('/auth/register', userData);
            return { 
                success: true, 
                message: res.message || 'Your registration has been submitted successfully. Your account is currently awaiting approval from the administrator.',
                data: res.data
            };
        } catch (err) {
            return {
                success: false,
                message: err.message || 'Registration failed. Please try again.'
            };
        }
    },

    /**
     * Log in an existing user (Company or Admin)
     */
    async login(email, password) {
        try {
            const res = await API.post('/auth/login', { email, password });
            if (res.data && res.data.token) {
                API.setToken(res.data.token);
                localStorage.setItem('winstar_user', JSON.stringify(res.data.user));
            }
            return { success: true, user: res.data.user };
        } catch (err) {
            const errorStatus = err.data && err.data.errors ? err.data.errors.status : null;
            return {
                success: false,
                message: err.message || 'Invalid email or password.',
                status: errorStatus
            };
        }
    },

    /**
     * Get current logged in user from localStorage/cache
     */
    getUser() {
        try {
            const cached = localStorage.getItem('winstar_user');
            return cached ? JSON.parse(cached) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Fetch fresh user profile from backend
     */
    async getProfile() {
        try {
            const res = await API.get('/users/me');
            if (res.data && res.data.user) {
                localStorage.setItem('winstar_user', JSON.stringify(res.data.user));
                return res.data.user;
            }
            return null;
        } catch (err) {
            return null;
        }
    },

    /**
     * Check if user is authenticated as wholesale / approved
     */
    isWholesale() {
        const user = this.getUser();
        return user && user.status === 'approved';
    },

    /**
     * Check if current user is admin
     */
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },

    /**
     * Logout user
     */
    logout() {
        API.setToken(null);
        localStorage.removeItem('winstar_user');
        window.location.href = 'login.html';
    }
};

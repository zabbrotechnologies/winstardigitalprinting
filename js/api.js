/* js/api.js - Winstar Central REST API Client (Vercel & Local Dynamic Detection) */

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal ? 'http://localhost:5000/api' : '/api';

export const API = {
    getToken() {
        return localStorage.getItem('winstar_auth_token');
    },

    setToken(token) {
        if (token) {
            localStorage.setItem('winstar_auth_token', token);
        } else {
            localStorage.removeItem('winstar_auth_token');
        }
    },

    getHeaders(isMultipart = false) {
        const headers = {};
        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const isMultipart = options.body instanceof FormData;

        const config = {
            method: options.method || 'GET',
            headers: this.getHeaders(isMultipart),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const error = new Error(data.message || 'API request failed.');
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (err) {
            console.error(`API Error on [${config.method} ${endpoint}]:`, err);
            throw err;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        const isMultipart = body instanceof FormData;
        return this.request(endpoint, {
            method: 'POST',
            body: isMultipart ? body : JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        const isMultipart = body instanceof FormData;
        return this.request(endpoint, {
            method: 'PUT',
            body: isMultipart ? body : JSON.stringify(body)
        });
    },

    patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

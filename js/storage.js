/* js/storage.js - LocalStorage Persistence Wrapper for Demo Prototype */

/* Storage Keys */
const KEYS = {
    USERS: 'winstar_users',
    SESSION: 'winstar_session',
    CART: 'winstar_cart',
    ORDERS: 'winstar_orders',
    SAVED_ADDRESSES: 'winstar_addresses'
};

export const Storage = {
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error reading ${key} from localStorage`, e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            // Dispatch custom event for reactive UI updates
            window.dispatchEvent(new CustomEvent('winstar_storage_change', { detail: { key, value } }));
        } catch (e) {
            console.error(`Error saving ${key} to localStorage`, e);
        }
    },

    remove(key) {
        localStorage.removeItem(key);
        window.dispatchEvent(new CustomEvent('winstar_storage_change', { detail: { key, value: null } }));
    },

    /* User Authentication State */
    getCurrentUser() {
        return this.get(KEYS.SESSION, null);
    },

    setCurrentUser(user) {
        this.set(KEYS.SESSION, user);
    },

    logout() {
        this.remove(KEYS.SESSION);
    },

    /* Cart Items */
    getCart() {
        return this.get(KEYS.CART, []);
    },

    setCart(cartItems) {
        this.set(KEYS.CART, cartItems);
    },

    clearCart() {
        this.set(KEYS.CART, []);
    },

    /* Order History */
    getOrders() {
        return this.get(KEYS.ORDERS, []);
    },

    saveOrder(order) {
        const orders = this.getOrders();
        orders.unshift(order); // Newest first
        this.set(KEYS.ORDERS, orders);
    }
};

// store.js
// A simple mock state management system using localStorage to simulate a backend.

const STORE_KEY = 'new_star_xerox_store';

const initialState = {
    cart: [],
    orders: [],
    user: null, // null if not logged in
};

// Initialize store
export function initStore() {
    if (!localStorage.getItem(STORE_KEY)) {
        localStorage.setItem(STORE_KEY, JSON.stringify(initialState));
    }
}

// Get the current state
export function getStore() {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || initialState;
}

// Update the state
function updateStore(newState) {
    localStorage.setItem(STORE_KEY, JSON.stringify(newState));
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new Event('store_updated'));
}

// CART ACTIONS
export function addToCart(item) {
    const store = getStore();
    const newItem = {
        id: 'item_' + Date.now(),
        ...item
    };
    store.cart.push(newItem);
    updateStore(store);
    return newItem;
}

export function removeFromCart(itemId) {
    const store = getStore();
    store.cart = store.cart.filter(item => item.id !== itemId);
    updateStore(store);
}

export function clearCart() {
    const store = getStore();
    store.cart = [];
    updateStore(store);
}

export function getCartTotal() {
    const store = getStore();
    return store.cart.reduce((total, item) => total + (item.price * item.copies), 0);
}

// ORDER ACTIONS
export function placeOrder(checkoutDetails) {
    const store = getStore();
    if (store.cart.length === 0) return null;

    const newOrder = {
        orderId: 'NSX-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
        date: new Date().toISOString(),
        status: 'Order Placed',
        items: [...store.cart],
        total: getCartTotal(),
        details: checkoutDetails
    };

    store.orders.unshift(newOrder); // Add to beginning
    store.cart = []; // Clear cart after order
    updateStore(store);
    return newOrder;
}

export function getOrder(orderId) {
    const store = getStore();
    return store.orders.find(o => o.orderId === orderId);
}

// FORMATTING UTILS
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

/* js/cart.js - Cart Management for Wholesale & Business Orders */
import { Storage } from './storage.js';

export const Cart = {
    getItems() {
        return Storage.getCart();
    },

    addItem(item) {
        const cart = this.getItems();
        const newItem = {
            id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            addedAt: new Date().toISOString(),
            ...item
        };
        cart.push(newItem);
        Storage.setCart(cart);
        this.updateBadge();
        return newItem;
    },

    removeItem(itemId) {
        let cart = this.getItems();
        cart = cart.filter(i => i.id !== itemId);
        Storage.setCart(cart);
        this.updateBadge();
    },

    clear() {
        Storage.clearCart();
        this.updateBadge();
    },

    getTotal() {
        const cart = this.getItems();
        return cart.reduce((sum, item) => sum + parseFloat(item.pricing.total || 0), 0).toFixed(2);
    },

    updateBadge() {
        const cart = this.getItems();
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(b => {
            b.textContent = cart.length;
            b.style.display = cart.length > 0 ? 'flex' : 'none';
        });
    }
};

// Auto update badge on load
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());

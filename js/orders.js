/* js/orders.js - Order Management, Tracking & Reorder System */
import { Storage } from './storage.js';
import { Auth } from './auth.js';

export const Orders = {
    /**
     * Creates a new business wholesale order from current cart
     */
    createOrder(deliveryDetails, paymentMethod) {
        const cart = Storage.getCart();
        const user = Auth.getUser();

        if (cart.length === 0) {
            return { success: false, message: "Cart is empty." };
        }

        const orderId = 'WS-ORD-' + Math.floor(100000 + Math.random() * 900000);
        const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.pricing.subtotal || 0), 0);
        const totalGst = cart.reduce((sum, item) => sum + parseFloat(item.pricing.gst || 0), 0);
        const deliveryFee = deliveryDetails.method === 'courier' ? 150 : (deliveryDetails.method === 'express' ? 250 : 0);
        const grandTotal = (subtotal + totalGst + deliveryFee).toFixed(2);

        const newOrder = {
            id: orderId,
            createdAt: new Date().toISOString(),
            userId: user ? user.id : 'GUEST',
            customerName: user ? user.name : (deliveryDetails.name || 'Business Customer'),
            companyName: user ? user.companyName : (deliveryDetails.company || 'N/A'),
            items: cart,
            subtotal: subtotal.toFixed(2),
            gst: totalGst.toFixed(2),
            deliveryFee: deliveryFee.toFixed(2),
            total: grandTotal,
            deliveryDetails,
            paymentMethod,
            paymentStatus: 'PAID', // Demo successful payment
            orderStatus: 'PRINTING', // Initial active status: Placed -> Verified -> Printing -> Dispatched -> Delivered
            statusTimeline: [
                { stage: 'ORDER_PLACED', label: 'Order Placed', time: new Date().toLocaleTimeString(), completed: true },
                { stage: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', time: new Date().toLocaleTimeString(), completed: true },
                { stage: 'FILES_VERIFIED', label: 'Files Verified', time: new Date().toLocaleTimeString(), completed: true },
                { stage: 'PRINTING', label: 'Printing & Finishing', time: 'In Progress', active: true },
                { stage: 'PACKED', label: 'Packed for Delivery', completed: false },
                { stage: 'DISPATCHED', label: 'Courier Dispatched', completed: false },
                { stage: 'DELIVERED', label: 'Delivered', completed: false }
            ]
        };

        Storage.saveOrder(newOrder);
        Storage.clearCart();

        return { success: true, order: newOrder };
    },

    /**
     * Get list of orders for current user
     */
    getUserOrders() {
        const user = Auth.getUser();
        const allOrders = Storage.getOrders();
        if (!user) return allOrders.slice(0, 5); // Return demo list for guest
        return allOrders.filter(o => o.userId === user.id || o.customerName === user.name);
    },

    /**
     * Get single order by ID
     */
    getOrderById(orderId) {
        const allOrders = Storage.getOrders();
        return allOrders.find(o => o.id === orderId);
    },

    /**
     * 1-Click Reorder logic: Duplicates an entire previous order into cart
     */
    reorder(orderId) {
        const order = this.getOrderById(orderId);
        if (!order) return { success: false, message: "Order not found." };

        let cart = Storage.getCart();
        order.items.forEach(item => {
            const newItem = {
                ...item,
                id: 'cart_re_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                addedAt: new Date().toISOString()
            };
            cart.push(newItem);
        });

        Storage.setCart(cart);
        return { success: true, itemsCount: order.items.length };
    }
};

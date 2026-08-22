/* js/whatsapp.js - Pre-filled WhatsApp Order Message Generator */
import { WINSTAR_CONFIG } from './config.js';

export const WhatsAppOrder = {
    /**
     * Formats pre-filled WhatsApp message for print orders
     */
    formatMessage(order) {
        let msg = `*NEW PRINT INSTANT ORDER*\n`;
        msg += `────────────────────────\n\n`;
        msg += `*Request ID:* ${order.requestId || 'WSR-PENDING'}\n\n`;
        msg += `*Customer:* ${order.customerName}\n`;
        msg += `*Phone:* ${order.customerPhone}\n\n`;
        msg += `*Service:* ${(order.serviceName || 'PRINT ORDER').toUpperCase()}\n`;
        msg += `*File Name:* ${order.fileName || 'Uploaded Document'}\n\n`;

        if (order.options) {
            Object.keys(order.options).forEach(key => {
                if (order.options[key] && key !== 'instructions') {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    msg += `*${label}:* ${order.options[key]}\n`;
                }
            });
        }

        if (order.quantity) {
            msg += `*Quantity/Copies:* ${order.quantity}\n`;
        }

        if (order.options && order.options.instructions) {
            msg += `*Notes:* ${order.options.instructions}\n`;
        }

        msg += `\n*Estimated Total:* ₹${order.total} (Incl. GST)\n`;
        msg += `────────────────────────\n`;
        msg += `_Sent via Winstar Digital Printing Portal_`;

        return msg;
    },

    /**
     * Generates wa.me link to target phone
     */
    getWhatsAppUrl(formattedText, targetPhone = null) {
        const phone = targetPhone || WINSTAR_CONFIG.primaryWhatsapp;
        return `https://wa.me/${phone}?text=${encodeURIComponent(formattedText)}`;
    }
};

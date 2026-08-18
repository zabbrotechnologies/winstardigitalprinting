/* js/whatsapp.js - WhatsApp Formatted Message Generator & Clipboard Copy */
import { WINSTAR_CONFIG } from './config.js';

export const WhatsAppOrder = {
    /**
     * Formats a professional WhatsApp order text message from print job configuration
     */
    formatMessage(file, config, pricingResult, customerName = "Guest Customer") {
        let msg = `*WINSTAR DIGITAL PRINTING ORDER*\n`;
        msg += `------------------------------------\n`;
        msg += `*Customer:* ${customerName}\n`;
        msg += `*File:* ${file ? file.name : 'Document.pdf'}\n`;
        msg += `*Pages:* ${config.pageCount || 1}\n`;
        msg += `*Print Type:* ${config.printType === 'bw' ? 'Black & White' : 'Full Colour'}\n`;
        msg += `*Sides:* ${config.printSides === 'single' ? 'Single Side' : 'Double Side'}\n`;
        msg += `*Paper Size:* ${config.paperSize || 'A4'}\n`;
        msg += `*Paper Quality:* ${config.paperGsm || '80gsm'}\n`;
        msg += `*Paper Type:* ${config.paperType ? config.paperType.toUpperCase() : 'Copier'}\n`;
        msg += `*Copies:* ${config.copies || 1}\n`;
        msg += `*Binding:* ${config.bindingType ? config.bindingType.toUpperCase() : 'None'}\n`;
        msg += `*Finishing:* ${config.finishing ? config.finishing : 'None'}\n`;
        if (config.pageRange && config.pageRange !== 'all') {
            msg += `*Page Range:* ${config.pageRange}\n`;
        }
        if (config.instructions) {
            msg += `*Special Instructions:* ${config.instructions}\n`;
        }
        msg += `------------------------------------\n`;
        msg += `*Estimated Total:* ₹${pricingResult.total} (Incl. GST)\n`;
        msg += `------------------------------------\n`;
        msg += `_Sent via Winstar Digital Printing Online Portal_`;

        return msg;
    },

    /**
     * Generates wa.me URL
     */
    getWhatsAppUrl(formattedText, targetPhone = null) {
        const phone = targetPhone || WINSTAR_CONFIG.primaryWhatsapp;
        return `https://wa.me/${phone}?text=${encodeURIComponent(formattedText)}`;
    },

    /**
     * Copies order message text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }
};

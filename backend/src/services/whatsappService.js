const env = require('../config/env');

/**
 * Format WhatsApp Chat Link for a Service Request
 */
const generateWhatsAppLink = (serviceRequest) => {
    const businessPhone = env.WHATSAPP_BUSINESS_NUMBER;
    
    let msg = `*NEW PRINT INSTANTLY ORDER*\n`;
    msg += `------------------------------------\n`;
    msg += `*Request ID:* ${serviceRequest.request_number}\n`;
    msg += `*Customer:* ${serviceRequest.customer_name}\n`;
    msg += `*Phone:* ${serviceRequest.customer_phone}\n`;
    if (serviceRequest.customer_email) {
        msg += `*Email:* ${serviceRequest.customer_email}\n`;
    }
    msg += `------------------------------------\n`;
    msg += `*Service:* ${serviceRequest.service_type.toUpperCase()}\n`;
    msg += `*File:* ${serviceRequest.file_name || 'Attached Document'}\n`;
    msg += `*Pages:* ${serviceRequest.page_count || 1}\n`;
    msg += `*Print Type:* ${serviceRequest.print_type === 'bw' ? 'Black & White' : 'Full Colour'}\n`;
    msg += `*Sides:* ${serviceRequest.print_sides === 'single' ? 'Single Side' : 'Double Side'}\n`;
    msg += `*Paper Size:* ${serviceRequest.paper_size || 'A4'}\n`;
    msg += `*Paper Quality:* ${serviceRequest.paper_gsm || '80gsm'}\n`;
    msg += `*Paper Type:* ${serviceRequest.paper_type ? serviceRequest.paper_type.toUpperCase() : 'Copier'}\n`;
    msg += `*Copies:* ${serviceRequest.print_count || 1}\n`;
    msg += `*Binding:* ${serviceRequest.binding_type ? serviceRequest.binding_type.toUpperCase() : 'None'}\n`;
    if (serviceRequest.delivery_required) {
        msg += `*Delivery Required:* Yes (${serviceRequest.delivery_address || 'Address provided'})\n`;
    } else {
        msg += `*Pickup:* Store Pickup\n`;
    }
    if (serviceRequest.notes) {
        msg += `*Instructions:* ${serviceRequest.notes}\n`;
    }
    msg += `------------------------------------\n`;
    msg += `*Estimated Total:* ₹${serviceRequest.estimated_amount || '0.00'}\n`;
    msg += `------------------------------------\n`;
    msg += `_Sent via Winstar Digital Printing Portal_`;

    const encodedText = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodedText}`;

    return {
        whatsappUrl,
        formattedMessage: msg,
        businessNumber: businessPhone
    };
};

module.exports = {
    generateWhatsAppLink
};

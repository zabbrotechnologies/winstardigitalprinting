/* js/pricing.js - Centralized Pricing Engine for Personal & Wholesale Customers */
import { WINSTAR_CONFIG } from './config.js';

export const BASE_PRICING = {
    // Base print rates per page
    printType: {
        bw: { normal: 2.00, wholesale: 1.70 },
        colour: { normal: 10.00, wholesale: 8.50 }
    },
    
    // Sides multipliers
    printSides: {
        single: 1.0,
        double: 1.8 // Double-side discount factor
    },

    // Size multipliers relative to A4
    paperSize: {
        A5: 0.8,
        A4: 1.0,
        A3: 2.0,
        A2: 4.0,
        A1: 8.0,
        A0: 12.0
    },

    // GSM Multipliers
    paperGsm: {
        '70gsm': 1.0,
        '80gsm': 1.1,
        '100gsm': 1.3,
        '120gsm': 1.5,
        '150gsm': 1.8,
        '200gsm': 2.2,
        '300gsm': 2.8
    },

    // Paper Types
    paperType: {
        copier: 0.00,
        premium: 2.00,
        matte: 3.50,
        glossy: 4.00,
        art: 5.00,
        cardstock: 6.00,
        photo: 8.00
    },

    // Binding Base Prices per book
    binding: {
        none: { normal: 0, wholesale: 0 },
        staple: { normal: 5, wholesale: 3 },
        spiral: { normal: 45, wholesale: 35 },
        wiro: { normal: 60, wholesale: 48 },
        soft: { normal: 80, wholesale: 65 },
        perfect: { normal: 120, wholesale: 95 },
        hard: { normal: 200, wholesale: 160 },
        rexin: { normal: 250, wholesale: 200 }
    },

    // Lamination & Extra Finishing
    finishing: {
        none: 0,
        glossLamination: 15,
        matteLamination: 18,
        thermalLamination: 25,
        shapeCutting: 30
    }
};

/**
 * Calculates price for a given print job configuration
 * @param {Object} config - { printType, paperSize, printSides, paperGsm, paperType, bindingType, finishing, pageCount, copies }
 * @param {string} customerType - 'normal' | 'wholesale'
 */
export function calculatePrice(config, customerType = 'normal') {
    const isWholesale = customerType === 'wholesale';

    const pageCount = parseInt(config.pageCount || 1, 10);
    const copies = parseInt(config.copies || 1, 10);
    const printTypeKey = config.printType || 'bw';

    // Base price per page based on customer type
    let baseRate = BASE_PRICING.printType[printTypeKey][isWholesale ? 'wholesale' : 'normal'];

    // Multipliers
    const sizeMultiplier = BASE_PRICING.paperSize[config.paperSize || 'A4'] || 1.0;
    const sidesMultiplier = BASE_PRICING.printSides[config.printSides || 'single'] || 1.0;
    const gsmMultiplier = BASE_PRICING.paperGsm[config.paperGsm || '80gsm'] || 1.0;
    const paperAddon = BASE_PRICING.paperType[config.paperType || 'copier'] || 0;

    // Per page print cost
    const pageCost = (baseRate * sizeMultiplier * sidesMultiplier * gsmMultiplier) + paperAddon;

    // Total printing cost for all pages and copies
    const totalPrintCost = pageCost * pageCount * copies;

    // Binding Cost
    const bindingKey = config.bindingType || 'none';
    const bindingPricePerCopy = BASE_PRICING.binding[bindingKey] 
        ? BASE_PRICING.binding[bindingKey][isWholesale ? 'wholesale' : 'normal'] 
        : 0;
    const totalBindingCost = bindingPricePerCopy * copies;

    // Extra Finishing Cost
    const finishingKey = config.finishing || 'none';
    const finishingPrice = BASE_PRICING.finishing[finishingKey] || 0;
    const totalFinishingCost = finishingPrice * copies;

    // Subtotal
    const subtotal = totalPrintCost + totalBindingCost + totalFinishingCost;

    // GST calculation (18% included in display or itemized)
    const gstAmount = subtotal * 0.18;
    const grandTotal = subtotal + gstAmount;

    return {
        unitPageCost: pageCost.toFixed(2),
        totalPrintCost: totalPrintCost.toFixed(2),
        totalBindingCost: totalBindingCost.toFixed(2),
        totalFinishingCost: totalFinishingCost.toFixed(2),
        subtotal: subtotal.toFixed(2),
        gst: gstAmount.toFixed(2),
        total: Math.round(grandTotal).toFixed(2),
        isWholesale
    };
}

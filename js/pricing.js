/* js/pricing.js - Centralized Pricing Engine for Personal & Wholesale Customers */

export const BASE_PRICING = {
    // Base print rates per page
    printType: {
        bw: { normal: 2.00, wholesale: 1.50 },
        colour: { normal: 10.00, wholesale: 7.50 },
        goldAccent: { normal: 25.00, wholesale: 18.00 }
    },
    
    // Sides multipliers
    printSides: {
        single: 1.0,
        double: 1.8
    },

    // Size multipliers relative to A4
    paperSize: {
        A5: 0.8,
        A4: 1.0,
        A3: 2.0,
        A2: 4.0,
        A1: 8.0,
        A0: 12.0,
        "4x6": 0.5,
        "5x7": 0.7,
        "8x10": 1.0,
        "2x2": 0.15,
        "3x3": 0.25,
        "4x4": 0.4
    },

    // GSM Multipliers
    paperGsm: {
        '70gsm': 1.0,
        '80gsm': 1.1,
        '100gsm': 1.3,
        '130gsm': 1.4,
        '150gsm': 1.6,
        '170gsm': 1.8,
        '200gsm': 2.0,
        '250gsm': 2.4,
        '300gsm': 2.8,
        '350gsm': 3.2,
        '400gsm': 3.8
    },

    // Binding Base Prices per book
    binding: {
        none: { normal: 0, wholesale: 0 },
        staple: { normal: 5, wholesale: 3 },
        spiral: { normal: 45, wholesale: 30 },
        wiro: { normal: 60, wholesale: 45 },
        soft: { normal: 80, wholesale: 60 },
        perfect: { normal: 120, wholesale: 90 },
        hard: { normal: 200, wholesale: 150 },
        rexin: { normal: 250, wholesale: 180 }
    },

    // Service-specific unit prices
    unitServiceRates: {
        "business-cards": { normal: 2.50, wholesale: 1.80 },
        "stickers": { normal: 4.00, wholesale: 2.80 },
        "brochures": { normal: 12.00, wholesale: 8.50 },
        "certificates": { normal: 35.00, wholesale: 25.00 },
        "photo-print": { normal: 15.00, wholesale: 10.00 },
        "lamination": { normal: 20.00, wholesale: 14.00 },
        "binding": { normal: 45.00, wholesale: 30.00 }
    }
};

/**
 * Calculates price for a given print job configuration
 * @param {Object} config - Order configuration fields
 * @param {string} serviceId - Service ID or 'quick-print'
 * @param {string} customerType - 'normal' | 'wholesale'
 */
export function calculatePrice(config, serviceId = 'quick-print', customerType = 'normal') {
    const isWholesale = customerType === 'wholesale';
    const rateType = isWholesale ? 'wholesale' : 'normal';
    const quantity = Math.max(1, parseInt(config.quantity || config.copies || 1, 10));
    const pageCount = Math.max(1, parseInt(config.pageCount || 1, 10));

    let subtotal = 0;

    if (serviceId === 'quick-print' || !BASE_PRICING.unitServiceRates[serviceId]) {
        // General Document Print Calculation
        const printTypeKey = config.printType || 'bw';
        const baseRate = BASE_PRICING.printType[printTypeKey] 
            ? (BASE_PRICING.printType[printTypeKey][rateType] || 2.0)
            : 2.0;

        const sizeMult = BASE_PRICING.paperSize[config.paperSize || 'A4'] || 1.0;
        const sidesMult = BASE_PRICING.printSides[config.printSides || 'single'] || 1.0;
        const gsmMult = BASE_PRICING.paperGsm[config.paperGsm || '80gsm'] || 1.0;

        const perPageRate = baseRate * sizeMult * sidesMult * gsmMult;
        const printCost = perPageRate * pageCount * quantity;

        const bindingKey = config.bindingType || 'none';
        const bindingRate = BASE_PRICING.binding[bindingKey]
            ? (BASE_PRICING.binding[bindingKey][rateType] || 0)
            : 0;
        const bindingCost = bindingRate * quantity;

        subtotal = printCost + bindingCost;
    } else {
        // Specific Service Calculation (e.g. Business Cards, Stickers, Certificates)
        const rateObj = BASE_PRICING.unitServiceRates[serviceId] || { normal: 5.0, wholesale: 3.5 };
        const unitRate = rateObj[rateType] || rateObj.normal || 5.0;

        const gsmMult = BASE_PRICING.paperGsm[config.paperGsm || '300gsm'] || 1.0;
        const sidesMult = BASE_PRICING.printSides[config.printSides || 'single'] || 1.0;

        const unitCost = unitRate * gsmMult * sidesMult;
        subtotal = unitCost * quantity;
    }

    if (isNaN(subtotal) || subtotal < 0) subtotal = 0;

    const gstAmount = subtotal * 0.18;
    const total = Math.round(subtotal + gstAmount);

    return {
        subtotal: subtotal.toFixed(2),
        gst: gstAmount.toFixed(2),
        total: total.toFixed(2),
        isWholesale
    };
}

/* js/bulk-order.js - Wholesale Portal & Business Ordering Controller */
import { Auth } from './auth.js';

export function initBulkOrderPage() {
    const isWholesale = Auth.isWholesale();
    const guestView = document.getElementById('wholesaleGuestView');
    const activeView = document.getElementById('wholesaleActiveView');

    if (isWholesale) {
        if (guestView) guestView.style.display = 'none';
        if (activeView) activeView.style.display = 'block';
    } else {
        if (guestView) guestView.style.display = 'block';
        if (activeView) activeView.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', initBulkOrderPage);

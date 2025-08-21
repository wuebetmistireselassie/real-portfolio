export function calculatePrice(serviceType, deliveryTime, deliverables) {
    let basePrice = 0;

    // --- Base prices per service ---
    switch (serviceType) {
        case 'logo':        // Custom Logo Design
            basePrice = 300;
            break;
        case 'branding':    // Branding Kit
            basePrice = 500;
            break;
        case 'stationery':  // Business Card & Stationery
            basePrice = 150;
            break;
        case 'socialkit': // Social Media Kit
            basePrice = 250;
            break;
        case 'digitalassets': // Marketing & Digital Assets
            basePrice = 400;
            break;

        // Existing services
        case 'powerpoint':
            basePrice = 50;
            break;
        case 'word':
            basePrice = 30;
            break;
        case 'excel':
            basePrice = 40;
            break;
        case 'files':
            basePrice = 20;
            break;
        case 'admin':
            basePrice = 25;
            break;
    }

    // --- Delivery time multipliers ---
    let deliveryMultiplier = 1;
    switch (deliveryTime) {
        case 'standard':
            deliveryMultiplier = 1;
            break;
        case 'express':
            deliveryMultiplier = 1.5;
            break;
        case 'urgent':
            deliveryMultiplier = 2;
            break;
    }

    // --- Deliverables fee ---
    let deliverablesFee = 0;
    if (deliverables) {
        const deliverablesArray = deliverables
            .split(',')
            .map(d => d.trim())
            .filter(d => d);
        deliverablesFee = deliverablesArray.length * 5; // $5 per deliverable
    }

    // --- Final total ---
    let totalPrice = basePrice * deliveryMultiplier + deliverablesFee;

    // --- Minimum price rule ---
    if (totalPrice < 20) totalPrice = 20;

    return totalPrice;
}


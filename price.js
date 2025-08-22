export function calculatePrice(serviceType, deliveryTime, deliverables) {
    let basePrice = 0;

    // --- Base prices per service (in ETB) ---
    switch (serviceType) {
        case 'logo':        // Custom Logo Design
            basePrice = 6500;
            break;
        case 'branding':    // Brand Identity & Guidelines
            basePrice = 12000;
            break;
        case 'stationery':  // Business Stationery Design
            basePrice = 4000;
            break;
        case 'socialkit':   // Social Media Kit
            basePrice = 5000;
            break;
        case 'digitalassets': // Website & Digital Assets
            basePrice = 9000;
            break;

        // --- Document & Office Services ---
        case 'powerpoint':  // Presentation Design
            basePrice = 3000;
            break;
        case 'word':        // Word Formatting
            basePrice = 1800;
            break;
        case 'excel':       // Excel Tasks
            basePrice = 2500;
            break;
        case 'files':       // File Conversion
            basePrice = 1000;
            break;
        case 'admin':       // Data Entry/Admin Support
            basePrice = 1500;
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
        if (deliverablesArray.length > 1) {
            deliverablesFee = (deliverablesArray.length - 1) * 150; // fee applies only after the first
        }
    }

    // --- Final total ---
    let totalPrice = basePrice * deliveryMultiplier + deliverablesFee;

    // --- Minimum price rule ---
    if (totalPrice < 1000) totalPrice = 1000; // make sure very small tasks aren’t underpriced

    return totalPrice;
}
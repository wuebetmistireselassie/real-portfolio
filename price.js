export function calculatePrice(serviceType, deliveryTime, deliverables) {
    let basePrice = 0;
    switch (serviceType) {
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

    // Add a small fee per deliverable listed
    const deliverablesFee = deliverables.split(',').length * 5;

    const totalPrice = basePrice * deliveryMultiplier + deliverablesFee;
    return totalPrice;
}

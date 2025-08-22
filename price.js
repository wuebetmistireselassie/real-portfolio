// price.js

// Base prices per service
const BASE_PRICES = {
  logo: 6500,
  branding: 12000,
  stationery: 4000,
  socialkit: 5000,
  digitalassets: 9000,
  files: 1000,
  admin: 1500,
  powerpoint: 3000, 
  word: 1800,        
  excel: 1800        
};

// Deliverable fees per service
const DELIVERABLE_FEES = {
  logo: {
    PNG: 0,
    JPG: 0,
    SVG: 1000,
    PDF: 300,
    AI: 1000,
    EPS: 1000
  },
  branding: {
    "Brand Guidelines": 2000,
    "Color Palette": 1500,
    "Typography": 1000,
    "Logo Variations": 1000
  },
  stationery: {
    "Business Card": 500,
    "Letterhead": 500,
    "Envelope": 500,
    "Email Signature": 500
  },
  socialkit: {
    "Profile Pictures": 1500,
    "Cover Images": 1500,
    "Post Templates": 1500,
    "Story Templates": 1500
  },
  digitalassets: {
    "Website Banners": 1000,
    "App Icons": 1500,
    "Favicon": 2000,
    "Presentation Templates": 1500
  },
  files: {
    file_DOCX: 500,
    file_PDF: 500,
    file_XLSX: 500,
    file_JPG: 500,
    file_PNG: 500,
    file_Other: 500
  },
  admin: {
    "Excel/CSV Report": 500,
    "Formatted Data": 500,
    "Word Document": 500,
    "PDF Output": 500
  },
  powerpoint: {},
  word: {},
  excel: {}
};

// Delivery time multipliers
const DELIVERY_MULTIPLIERS = {
  standard: 1,
  express: 1.5,
  urgent: 2
};

/**
 * Calculate total price
 * @param {string} serviceType - e.g. "logo"
 * @param {string} deliveryTime - "standard" | "express" | "urgent"
 * @param {Array<string>} deliverables - array of selected deliverables
 * @returns {number} total price
 */
export function calculatePrice(serviceType, deliveryTime, deliverables = []) {
  if (!serviceType || !deliveryTime) return 0;

  let base = BASE_PRICES[serviceType] || 0;
  let total = base;

  // Add deliverable fees if defined
  if (DELIVERABLE_FEES[serviceType]) {
    for (const d of deliverables) {
      if (DELIVERABLE_FEES[serviceType].hasOwnProperty(d)) {
        total += DELIVERABLE_FEES[serviceType][d];
      }
    }
  }

  const multiplier = DELIVERY_MULTIPLIERS[deliveryTime] || 1;
  return total * multiplier;
}

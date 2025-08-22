// price.js

// Base prices per service
const BASE_PRICES = {
  logo: 1500,
  branding: 2500,
  stationery: 1200,
  socialkit: 1800,
  digitalassets: 2200,
  files: 500,
  admin: 800,
  powerpoint: 1000, // single-file fixed
  word: 700,        // single-file fixed
  excel: 900        // single-file fixed
};

// Deliverable fees per service
const DELIVERABLE_FEES = {
  logo: {
    PNG: 200,
    JPG: 200,
    SVG: 400,
    PDF: 300,
    AI: 500,
    EPS: 500
  },
  branding: {
    "Brand Guidelines": 800,
    "Color Palette": 300,
    "Typography": 400,
    "Logo Variations": 600
  },
  stationery: {
    "Business Card": 300,
    "Letterhead": 300,
    "Envelope": 250,
    "Email Signature": 350
  },
  socialkit: {
    "Profile Pictures": 300,
    "Cover Images": 300,
    "Post Templates": 400,
    "Story Templates": 400
  },
  digitalassets: {
    "Website Banners": 500,
    "App Icons": 400,
    "Favicon": 200,
    "Presentation Templates": 600
  },
  files: {
    file_DOCX: 150,
    file_PDF: 150,
    file_XLSX: 200,
    file_JPG: 120,
    file_PNG: 120,
    file_Other: 200
  },
  admin: {
    "Excel/CSV Report": 250,
    "Formatted Data": 300,
    "Word Document": 200,
    "PDF Output": 200
  },
  // 🚫 No deliverables for these (fixed)
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
      if (DELIVERABLE_FEES[serviceType][d]) {
        total += DELIVERABLE_FEES[serviceType][d];
      }
    }
  }

  const multiplier = DELIVERY_MULTIPLIERS[deliveryTime] || 1;
  return total * multiplier;
}

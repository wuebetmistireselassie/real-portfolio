// price.js

// -----------------------------------------------------
// Service Pricing Table
// -----------------------------------------------------
export const SERVICE_PRICING = {
  logo: {
    base: 6500,
    deliverables: {
      png_pack: 200,
      jpg_pack: 200,
      pdf_print: 200,
      mono_variant: 200,
      inverse_variant: 200,
      svg_vector: 1000,
      eps_print: 1000,
      ai_source: 1000,
      favicon_set: 1000,
      usage_sheet_1p: 2000,
    },
  },
  branding: {
    base: 12000,
    deliverables: {
      color_palette_spec: 1500,
      typography_spec: 1500,
      brand_kit_zip: 1000,
      brand_templates_basic: 2000,
      logo_lockups_pack: 2500,
      iconography20: 3000,
      mockups_set10: 3500,
      brand_guide_core: 3500,
      brand_guide_extended: 5000,
    },
  },
  stationery: {
    base: 4000,
    deliverables: {
      business_card: 500,
      letterhead: 500,
      envelope: 500,
      email_signature: 1000,
    },
  },
  socialkit: {
    base: 5000,
    deliverables: {
      profile_image_set: 500,
      cover_banner: 500,
      post_templates5: 2000,
      story_templates5: 1500,
    },
  },
  digitalassets: {
    base: 7000,
    deliverables: {
      hero_banners3: 2500,
      icon_set20: 2000,
      favicon_manifest: 1000,
      ui_kit_basic: 3000,
    },
  },
  powerpoint: {
    base: 6000,
    deliverables: {
      pptx_editable: 1000,
      pdf_export: 500,
      template_masters: 2000,
      custom_icons20: 1500,
    },
  },
  word: {
    base: 3000,
    deliverables: {
      dotx_template: 1000,
      styleset: 1000,
      pdf_export: 500,
    },
  },
  excel: {
    base: 3500,
    deliverables: {
      data_cleaning: 1000,
      dashboard_basic: 2000,
      pivot_report: 1500,
      pdf_export: 500,
    },
  },
  files: {
    base: 1000,
    deliverables: {
      pdf_to_word: 500,
      compress_optimize: 500,
      batch_rename: 500,
      image_to_vector: 1500,
    },
  },
  admin: {
    base: 2000,
    deliverables: {
      data_entry_100rows: 1000,
      deduplicate_1000rows: 1500,
      formatting_50pages: 2000,
      web_research_1h: 2000,
    },
  },
};

// -----------------------------------------------------
// Mapping from UI labels (orders.html) → pricing slugs
// -----------------------------------------------------
const DELIVERABLE_LABEL_MAP = {
  // --- Logo ---
  "PNG": "png_pack",
  "JPG": "jpg_pack",
  "SVG": "svg_vector",
  "PDF": "pdf_print",
  "AI (Adobe Illustrator)": "ai_source",
  "EPS": "eps_print",

  // --- Branding ---
  "Brand Guidelines PDF": "brand_guide_core",
  "Color Palette (ASE file)": "color_palette_spec",
  "Typography Files": "typography_spec",
  "Logo Variations (PNG, JPG, SVG)": "logo_lockups_pack",

  // --- Stationery ---
  "Business Card (JPG, PDF)": "business_card",
  "Letterhead (DOCX, PDF)": "letterhead",
  "Envelope Design (JPG, PDF)": "envelope",
  "Email Signature (HTML/PNG)": "email_signature",

  // --- Social Media Kit ---
  "Profile Pictures (PNG, JPG)": "profile_image_set",
  "Cover Images (PNG, JPG)": "cover_banner",
  "Post Templates (PSD/AI)": "post_templates5",
  "Story Templates (PNG, JPG)": "story_templates5",

  // --- Digital Assets ---
  "Website Banners (PNG, JPG)": "hero_banners3",
  "App Icons (PNG, SVG)": "icon_set20",
  "Favicon (ICO/PNG)": "favicon_manifest",
  "Presentation Templates (PPTX, PDF)": "ui_kit_basic",

  // --- PowerPoint ---
  "Editable PPTX File": "pptx_editable",
  "PDF Version": "pdf_export",
  "Custom Slide Templates": "template_masters",
  "Icons/Graphics Pack": "custom_icons20",

  // --- Word ---
  "Formatted DOCX": "dotx_template",
  "Exported PDF": "pdf_export",
  "Custom Word Template (DOTX)": "dotx_template",
  "Styles & Headings Setup": "styleset",

  // --- Excel ---
  "Formatted XLSX File": "data_cleaning",
  "Exported PDF": "pdf_export",
  "Custom Templates": "dashboard_basic",
  "Pivot Tables/Charts": "pivot_report",

  // --- Files ---
  "DOCX": "pdf_to_word",
  "PDF": "compress_optimize",
  "XLSX": "batch_rename",
  "JPG": "image_to_vector",
  "PNG": "image_to_vector",
  "Other File Conversions": "image_to_vector",

  // --- Admin ---
  "Excel/CSV Report": "data_entry_100rows",
  "Cleaned/Formatted Data": "deduplicate_1000rows",
  "Word Document": "formatting_50pages",
  "PDF Output": "web_research_1h",
};

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
function roundToNearest(value, step = 50) {
  return Math.round(value / step) * step;
}

// -----------------------------------------------------
// Main calculator
// -----------------------------------------------------
export function calculatePrice(serviceType, deliveryTime, deliverables) {
  const serviceConfig = SERVICE_PRICING[serviceType];
  if (!serviceConfig) return 0;

  const basePrice = serviceConfig.base || 0;

  // Delivery multiplier
  let multiplier = 1;
  if (deliveryTime === "express") multiplier = 1.5;
  if (deliveryTime === "urgent") multiplier = 2;

  // Normalize deliverables (string or array)
  let selected = [];
  if (Array.isArray(deliverables)) {
    selected = deliverables;
  } else if (typeof deliverables === "string") {
    selected = deliverables.split(/[,;|/]+/);
  }

  // Map UI labels → internal slugs and add fees
  let fee = 0;
  for (let d of selected) {
    const key = DELIVERABLE_LABEL_MAP[d.trim()];
    if (key && serviceConfig.deliverables[key]) {
      fee += serviceConfig.deliverables[key];
    }
  }

  let total = (basePrice + fee) * multiplier;
  total = roundToNearest(total, 50);
  return total < 1000 ? 1000 : total;
}

// price.js

// -----------------------------------------------------
// Centralized service pricing & deliverables table
// -----------------------------------------------------
export const SERVICE_PRICING = {
  // ---------- Creative & Design ----------
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
      compliment_slip: 500,
      envelope: 600,
      business_card: 700,
      letterhead: 700,
      id_card_template: 700,
      email_signature: 800,
      invoice_template: 900,
    },
  },

  socialkit: {
    base: 5000,
    deliverables: {
      profile_image_set: 300,
      highlight_icons5: 500,
      cover_banner: 700,
      reels_cover_pack10: 800,
      post_templates5: 900,
      story_templates5: 900,
    },
  },

  digitalassets: {
    base: 9000,
    deliverables: {
      image_opt_pack: 800,
      favicon_manifest: 900,
      hero_banners3: 1800,
      icon_set20: 2000,
      illustration1: 2000,
      ui_kit_basic: 2200,
    },
  },

  // ---------- Document & Office ----------
  powerpoint: {
    base: 3000,
    deliverables: {
      pdf_export: 200,
      pptx_editable: 300,
      chart_styles: 600,
      custom_icons20: 700,
      animation_builds: 800,
      template_masters: 900,
    },
  },

  word: {
    base: 1800,
    deliverables: {
      header_footer: 300,
      styleset: 400,
      toc_setup: 400,
      dotx_template: 500,
      mail_merge_setup: 700,
    },
  },

  excel: {
    base: 2500,
    deliverables: {
      data_cleaning: 600,
      pivot_report: 700,
      chart_pack: 700,
      dashboard_basic: 1200,
      vba_automation_light: 1500,
    },
  },

  files: {
    base: 1000,
    deliverables: {
      pdf_to_word: 200,
      compress_optimize: 200,
      batch_rename: 250,
      image_to_vector: 2000,
    },
  },

  admin: {
    base: 1500,
    deliverables: {
      data_entry_100rows: 300,
      deduplicate_1000rows: 300,
      web_research_1h: 400,
      formatting_50pages: 500,
    },
  },
};

// -----------------------------------------------------
// Label map: UI label → internal slug
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
  "PDF Output": "web_research_1h"
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
  const svcKey = String(serviceType || "").toLowerCase();
  const serviceConfig = SERVICE_PRICING[svcKey];
  if (!serviceConfig) return 0;

  // Base
  const basePrice = serviceConfig.base || 0;

  // Delivery multiplier
  let multiplier = 1;
  switch (String(deliveryTime || "").toLowerCase()) {
    case "express":
      multiplier = 1.5;
      break;
    case "urgent":
      multiplier = 2;
      break;
    default:
      multiplier = 1;
  }

  // Normalize deliverables (array expected)
  const selected = Array.isArray(deliverables) ? deliverables : [];

  // Add up mapped deliverable fees
  let fee = 0;
  for (let d of selected) {
    const key = DELIVERABLE_LABEL_MAP[d];
    if (key && serviceConfig.deliverables[key]) {
      fee += serviceConfig.deliverables[key];
    }
  }

  // Total = (base + fees) × multiplier
  let total = (basePrice + fee) * multiplier;

  // Round & enforce min
  total = roundToNearest(total, 50);
  if (total < 1000) total = 1000;

  return total;
}

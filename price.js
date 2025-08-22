// price.js

// -----------------------------------------------------
// Centralized service pricing & deliverables table
// -----------------------------------------------------
export const SERVICE_PRICING = {
  logo: {
    base: 6500,
    baseline: "png_pack",
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
    baseline: "color_palette_spec",
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
    baseline: "compliment_slip",
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
    baseline: "profile_image_set",
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
    baseline: "image_opt_pack",
    deliverables: {
      image_opt_pack: 800,
      favicon_manifest: 900,
      hero_banners3: 1800,
      icon_set20: 2000,
      illustration1: 2000,
      ui_kit_basic: 2200,
    },
  },
  powerpoint: {
    base: 3000,
    baseline: "pdf_export",
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
    baseline: "header_footer",
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
    baseline: "data_cleaning",
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
    baseline: "pdf_to_word",
    deliverables: {
      pdf_to_word: 200,
      compress_optimize: 200,
      batch_rename: 250,
      image_to_vector: 2000,
    },
  },
  admin: {
    base: 1500,
    baseline: "data_entry_100rows",
    deliverables: {
      data_entry_100rows: 300,
      deduplicate_1000rows: 300,
      web_research_1h: 400,
      formatting_50pages: 500,
    },
  },
};

// -----------------------------------------------------
// Label mapping (UI → internal slugs)
// -----------------------------------------------------
const DELIVERABLE_LABEL_MAP = {
  // Logo (from orders.html checkboxes)
  "png": "png_pack",
  "jpg": "jpg_pack",
  "svg": "svg_vector",
  "pdf": "pdf_print",
  "eps": "eps_print",
  "ai (adobe illustrator)": "ai_source",

  // Branding
  "brand guidelines pdf": "brand_guide_core",
  "color palette (ase file)": "color_palette_spec",
  "typography files": "typography_spec",
  "logo variations (png, jpg, svg)": "logo_lockups_pack",

  // Stationery
  "business card (jpg, pdf)": "business_card",
  "letterhead (docx, pdf)": "letterhead",
  "envelope design (jpg, pdf)": "envelope",
  "email signature (html/png)": "email_signature",

  // Social kit
  "profile pictures (png, jpg)": "profile_image_set",
  "cover images (png, jpg)": "cover_banner",
  "post templates (psd/ai)": "post_templates5",
  "story templates (png, jpg)": "story_templates5",

  // Digital assets
  "website banners (png, jpg)": "hero_banners3",
  "app icons (png, svg)": "icon_set20",
  "favicon (ico/png)": "favicon_manifest",
  "presentation templates (pptx, pdf)": "ui_kit_basic",

  // PowerPoint
  "editable pptx file": "pptx_editable",
  "pdf version": "pdf_export",
  "custom slide templates": "template_masters",
  "icons/graphics pack": "custom_icons20",

  // Word
  "formatted docx": "header_footer",
  "exported pdf": "pdf_export",
  "custom word template (dotx)": "dotx_template",
  "styles & headings setup": "styleset",

  // Excel
  "formatted xlsx file": "data_cleaning",
  "exported pdf": "pdf_export",
  "custom templates": "dashboard_basic",
  "pivot tables/charts": "pivot_report",

  // Files
  "docx": "pdf_to_word",
  "pdf": "pdf_to_word",
  "xlsx": "batch_rename",
  "jpg": "compress_optimize",
  "png": "compress_optimize",
  "other file conversions": "image_to_vector",

  // Admin
  "excel/csv report": "data_entry_100rows",
  "cleaned/formatted data": "deduplicate_1000rows",
  "word document": "formatting_50pages",
  "pdf output": "formatting_50pages",
};

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
function roundToNearest(value, step = 50) {
  return Math.round(value / step) * step;
}

function normalizeKey(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseDeliverables(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return Array.from(new Set(input.map((d) => normalizeKey(d)).filter(Boolean)));
  }
  const raw = String(input).trim();
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return Array.from(new Set(arr.map((d) => normalizeKey(d)).filter(Boolean)));
      }
    } catch (_) {}
  }
  return Array.from(new Set(
    raw.split(/[\,\n\r;|\/\s]+/)
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean)
  ));
}

function resolveSlug(serviceConfig, maybeSlug) {
  const fees = serviceConfig?.deliverables || {};
  if (!maybeSlug) return null;

  const normalized = normalizeKey(maybeSlug);

  // direct key
  if (Object.prototype.hasOwnProperty.call(fees, normalized)) return normalized;

  // via label map (both raw and normalized)
  if (DELIVERABLE_LABEL_MAP[maybeSlug.toLowerCase()]) {
    return DELIVERABLE_LABEL_MAP[maybeSlug.toLowerCase()];
  }
  if (DELIVERABLE_LABEL_MAP[normalized]) {
    return DELIVERABLE_LABEL_MAP[normalized];
  }

  return null;
}

function sumSelectedFees(serviceConfig, selectedSlugs) {
  const fees = serviceConfig?.deliverables || {};
  let sum = 0;
  for (const raw of selectedSlugs) {
    const key = resolveSlug(serviceConfig, raw);
    if (key && fees[key]) sum += Number(fees[key]) || 0;
  }
  return sum;
}

// -----------------------------------------------------
// Main calculator
// -----------------------------------------------------
export function calculatePrice(serviceType, deliveryTime, deliverables) {
  const svcKey = normalizeKey(serviceType);
  const serviceConfig = SERVICE_PRICING[svcKey];
  const basePrice = serviceConfig?.base ?? 0;

  let deliveryMultiplier = 1;
  switch (normalizeKey(deliveryTime)) {
    case "express": deliveryMultiplier = 1.5; break;
    case "urgent": deliveryMultiplier = 2; break;
    default: deliveryMultiplier = 1;
  }

  const selected = parseDeliverables(deliverables);
  const deliverablesFee = serviceConfig ? sumSelectedFees(serviceConfig, selected) : 0;

  let totalPrice = (basePrice + deliverablesFee) * deliveryMultiplier;
  totalPrice = roundToNearest(totalPrice, 50);
  if (totalPrice < 1000) totalPrice = 1000;

  return totalPrice;
}

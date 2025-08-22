// price.js

// -----------------------------------------------------
// Centralized service pricing & deliverables table
// -----------------------------------------------------
export const SERVICE_PRICING = {
  // ---------- Creative & Design ----------
  logo: {
    base: 6500,
    baseline: "png_pack", // kept for reference; not used in simplified math
    deliverables: {
      // Baseline-level (light exports/variants)
      png_pack: 200,
      jpg_pack: 200,
      pdf_print: 200,
      mono_variant: 200,
      inverse_variant: 200,
      // Premium/source/scalable
      svg_vector: 1000,
      eps_print: 1000,
      ai_source: 1000,
      favicon_set: 1000,
      // Documentation
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

  // ---------- Document & Office ----------
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
      image_to_vector: 2000, // skilled vector tracing/redraw (logo recreation)
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
// Helpers
// -----------------------------------------------------

/** Round to nearest step (default ETB 50). */
function roundToNearest(value, step = 50) {
  return Math.round(value / step) * step;
}

/** Normalize any label/slug to a comparable key (e.g., "SVG Vector" -> "svg_vector"). */
function normalizeKey(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Parse deliverables from:
 * - Array of strings
 * - JSON string '["a","b"]'
 * - CSV / semicolon / pipe / slash / whitespace separated string
 * - Single string value
 * Returns a deduplicated array of normalized slugs.
 */
function parseDeliverables(input) {
  if (!input) return [];

  // Already an array?
  if (Array.isArray(input)) {
    return Array.from(
      new Set(input.map((d) => normalizeKey(d)).filter(Boolean))
    );
  }

  const raw = String(input).trim();

  // JSON array string?
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return Array.from(new Set(arr.map((d) => normalizeKey(d)).filter(Boolean)));
      }
    } catch (_) {
      // if JSON parse fails, fall through to separator parsing
    }
  }

  // ✅ BULLETPROOF SPLIT:
  // split by comma, semicolon, pipe, slash OR any whitespace (spaces, tabs, newlines)
  const parts = raw
    .split(/[,\n\r;|\/\s]+/)
    .map((d) => normalizeKey(d))
    .filter(Boolean);

  // de-duplicate
  return Array.from(new Set(parts));
}

/** Resolve a possibly human label to a real fee key in the service's deliverables. */
function resolveSlug(serviceConfig, maybeSlug) {
  const fees = serviceConfig?.deliverables || {};
  if (!maybeSlug) return null;

  // Exact key hit
  if (Object.prototype.hasOwnProperty.call(fees, maybeSlug)) return maybeSlug;

  // Try normalized match against each existing key
  const target = normalizeKey(maybeSlug);
  for (const key of Object.keys(fees)) {
    if (normalizeKey(key) === target) return key;
  }
  return null; // unknown deliverable -> ignored
}

/** Sum fees for selected deliverables, resolving labels->slugs and ignoring unknowns. */
function sumSelectedFees(serviceConfig, selectedSlugs) {
  const fees = serviceConfig?.deliverables || {};
  let sum = 0;
  for (const raw of selectedSlugs) {
    const key = resolveSlug(serviceConfig, raw);
    if (key) sum += Number(fees[key]) || 0;
  }
  return sum;
}

// -----------------------------------------------------
// Main calculator
// -----------------------------------------------------

/**
 * Simplified formula:
 * totalPrice = (basePrice + sum(deliverables)) * deliveryMultiplier
 *
 * @param {string} serviceType one of the SERVICE_PRICING keys (e.g., 'logo', 'branding', ...)
 * @param {string} deliveryTime 'standard' | 'express' | 'urgent'
 * @param {string|string[]} deliverables CSV/labels/JSON array string or array of slugs
 * @returns {number} total price in ETB
 */
export function calculatePrice(serviceType, deliveryTime, deliverables) {
  const svcKey = normalizeKey(serviceType);
  const serviceConfig = SERVICE_PRICING[svcKey];

  // Base price
  const basePrice = serviceConfig?.base ?? 0;

  // Delivery time multipliers
  let deliveryMultiplier = 1;
  switch (normalizeKey(deliveryTime)) {
    case "express":
      deliveryMultiplier = 1.5;
      break;
    case "urgent":
      deliveryMultiplier = 2;
      break;
    case "standard":
    default:
      deliveryMultiplier = 1;
      break;
  }

  // Sum all selected deliverables (ignore unknown ones)
  const selected = parseDeliverables(deliverables);
  const deliverablesFee = serviceConfig
    ? sumSelectedFees(serviceConfig, selected)
    : 0;

  // Final price
  let totalPrice = (basePrice + deliverablesFee) * deliveryMultiplier;

  // Round to nearest 50 and enforce minimum 1000 ETB
  totalPrice = roundToNearest(totalPrice, 50);
  if (totalPrice < 1000) totalPrice = 1000;

  return totalPrice;
}

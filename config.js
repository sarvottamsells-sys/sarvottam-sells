// ══════════════════════════════════════════════════════════════════
//  CONFIG.JS — MASTER TEMPLATE FILE
//  ✏️  Aama badha changes karo, Owner.html + Shop.html banne update thase
// ══════════════════════════════════════════════════════════════════

const SITE_CONFIG = {

  // ──────────────────────────────────
  //  🏪  BRAND / SHOP NAME
  // ──────────────────────────────────
  brandName: "Sarvottam Sells",   // Main heading name (Owner + Shop dono ma)
  brandTagline: "Premium Collection", // Tagline (topbar badge)
  logoEmoji: "🏪",               // Logo emoji

  // ──────────────────────────────────
  //  🎨  COLORS
  // ──────────────────────────────────
  accentColor: "#b5541e",   // Main accent (buttons, highlights)
  accentLightColor: "#d9693a",   // Hover state accent
  accentBgColor: "#fdf0ea",   // Light accent background
  bgColor: "#faf8f4",   // Page background
  bg2Color: "#f3efe8",   // Secondary background (cards, upload zones)
  surfaceColor: "#ffffff",   // Cards, panels, header
  borderColor: "#e4ddd2",   // Light borders
  borderDarkColor: "#cdc5b8",   // Darker borders
  textColor: "#1c1a17",   // Main text
  textMidColor: "#4a4540",   // Secondary text
  textMutedColor: "#9a9188",   // Placeholder / muted text
  goldColor: "#9c7a3c",   // Gold accent (category, store row)
  goldBgColor: "#fdf8ef",   // Gold background
  greenColor: "#2d7a4f",   // Success / In stock
  greenBgColor: "#edf7f2",   // Green background
  redColor: "#c0392b",   // Error / Out of stock
  redBgColor: "#fdf0ef",   // Red background
  blueColor: "#2563a8",   // Info / links
  blueBgColor: "#eff4fb",   // Blue background

  // ──────────────────────────────────
  //  🔤  TYPOGRAPHY / FONTS
  // ──────────────────────────────────
  headingFont: "Cormorant Garamond",  // Serif heading font
  bodyFont: "Jost",               // Body / UI font
  brandFontSize: "26px",               // Header brand name font size
  brandFontWeight: "700",                // Brand name bold level (400-900)
  headingFontSize: "24px",               // Section headings
  bodyFontSize: "14px",               // General body text size
  labelFontSize: "11px",               // Form labels / small caps

  // ──────────────────────────────────
  //  📐  BORDER RADIUS / SPACING
  // ──────────────────────────────────
  borderRadius: "14px",     // Cards / modals
  inputRadius: "9px",      // Input fields
  buttonRadius: "10px",     // Buttons

  // ──────────────────────────────────
  //  🧭  HEADER / TOPBAR STYLE
  // ──────────────────────────────────
  headerStyle: "gufram",   // "gufram" = floating box (like gufram.it), "solid" = classic full-width

  // ──────────────────────────────────
  //  📢  ANNOUNCEMENT BAR
  // ──────────────────────────────────
  announcementBgColor: "",         // Leave blank to use accentColor
  announcementTextColor: "#ffffff",

  // ──────────────────────────────────
  //  🏠  SHOP PAGE — HERO SECTION
  // ──────────────────────────────────
  heroEyebrow: "Welcome to our store",          // Small text above hero title
  heroTitle: "Explore Our",                   // Hero big title (1st part)
  heroTitleAccent: "Collection",                    // Hero big title (accent/italic part)
  heroSubtitle: "Tap image to zoom · Click Buy Now to order instantly", // Sub text

  // ──────────────────────────────────
  //  🛒  SHOP PAGE — BUTTONS & TEXT
  // ──────────────────────────────────
  buyButtonText: "🛍 Buy Now",      // Buy button text
  buyButtonOosText: "🚫 Sold Out",     // Out-of-stock button text
  bulkOrderText: "📦",             // Bulk order button icon/text
  wishlistButtonText: "🤍 Wishlist",    // Wishlist button text
  searchPlaceholder: "Search products...", // Search input placeholder
  footerText: "Powered by MyStore", // Footer suffix

  // ──────────────────────────────────
  //  👤  OWNER PAGE — TEXT
  // ──────────────────────────────────
  ownerPanelBadge: "Owner Panel",     // Badge next to brand name in Owner page
  ownerAddTitle: "Add Product",     // Form heading when adding
  ownerEditTitle: "Edit Product",    // Form heading when editing
  viewShopText: "🛍 View Shop",    // Link button to Shop

  // ──────────────────────────────────
  //  🔗  CONTACT / SOCIAL
  // ──────────────────────────────────
  defaultWhatsApp: "",         // Default WhatsApp number (91XXXXXXXXXX) — optional
  instagramHandle: "",         // @yourshop — optional

};

// ══════════════════════════════════════════════════════════════════
// DO NOT EDIT BELOW THIS LINE
// ══════════════════════════════════════════════════════════════════
function applyConfig() {
  const r = document.documentElement.style;
  r.setProperty('--accent', SITE_CONFIG.accentColor);
  r.setProperty('--accent-lt', SITE_CONFIG.accentLightColor);
  r.setProperty('--accent-bg', SITE_CONFIG.accentBgColor);
  r.setProperty('--bg', SITE_CONFIG.bgColor);
  r.setProperty('--bg2', SITE_CONFIG.bg2Color);
  r.setProperty('--surface', SITE_CONFIG.surfaceColor);
  r.setProperty('--border', SITE_CONFIG.borderColor);
  r.setProperty('--border-dk', SITE_CONFIG.borderDarkColor);
  r.setProperty('--text', SITE_CONFIG.textColor);
  r.setProperty('--text-mid', SITE_CONFIG.textMidColor);
  r.setProperty('--text-muted', SITE_CONFIG.textMutedColor);
  r.setProperty('--gold', SITE_CONFIG.goldColor);
  r.setProperty('--gold-bg', SITE_CONFIG.goldBgColor);
  r.setProperty('--green', SITE_CONFIG.greenColor);
  r.setProperty('--green-bg', SITE_CONFIG.greenBgColor);
  r.setProperty('--red', SITE_CONFIG.redColor);
  r.setProperty('--red-bg', SITE_CONFIG.redBgColor);
  r.setProperty('--blue', SITE_CONFIG.blueColor);
  r.setProperty('--blue-bg', SITE_CONFIG.blueBgColor);
  r.setProperty('--radius', SITE_CONFIG.borderRadius);
  r.setProperty('--cfg-brand-size', SITE_CONFIG.brandFontSize);
  r.setProperty('--cfg-brand-wt', SITE_CONFIG.brandFontWeight);
  r.setProperty('--cfg-body-size', SITE_CONFIG.bodyFontSize);

  // Google Fonts dynamic load
  const fonts = [SITE_CONFIG.headingFont, SITE_CONFIG.bodyFont].filter(Boolean);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fonts.map(f => f.replace(/ /g, '+') + ':wght@300;400;600;700').join('&family=')}&display=swap`;
  document.head.appendChild(link);
}
applyConfig();

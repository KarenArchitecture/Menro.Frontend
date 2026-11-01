// src/themes/restaurantThemes.js
//
// SINGLE SOURCE OF TRUTH for restaurant themes.
// Used by:
//   1) the admin ThemeSection (picker + preview)
//   2) the public restaurant page (apply the saved theme)
//
// The backend only needs to store a theme id (e.g. "seafood").
// The frontend resolves that id to the tokens below.
//
// Public page usage:
//   import { applyTheme } from "../themes/restaurantThemes";
//   useEffect(() => applyTheme(pageRootRef.current, restaurant.themeId), [restaurant.themeId]);
//
// Then style the restaurant page with the CSS variables, e.g.
//   .menu-page   { background: var(--rt-bg); color: var(--rt-text); }
//   .product-card{ background: var(--rt-surface); border: 1px solid var(--rt-border);
//                  border-radius: var(--rt-radius-card); }
//   .price       { color: var(--rt-accent); }
//   .btn-order   { background: var(--rt-primary); color: var(--rt-on-primary);
//                  border-radius: var(--rt-radius-button); }

export const DEFAULT_THEME_ID = "modern";

/**
 * Token reference
 *  bg           page background
 *  surface      cards, panels, modals
 *  surfaceAlt   secondary surfaces (chips, inputs, hover)
 *  text         main text
 *  textMuted    secondary text
 *  border       borders and dividers
 *  primary      main buttons, active states
 *  onPrimary    text/icon colour placed on `primary`
 *  accent       prices, badges, highlights
 *  radiusCard   corner radius for cards
 *  radiusButton corner radius for buttons
 */
export const THEMES = [
  {
    id: "modern",
    label: "مدرن",
    description: "تیره و مینیمال با تاکید نارنجی",
    suggestedFor: "modern",
    mode: "dark",
    tokens: {
      bg: "#121212",
      surface: "#1e1e1e",
      surfaceAlt: "#2a2a2a",
      text: "#fafaf4",
      textMuted: "#a8a8a0",
      border: "#333333",
      primary: "#ff683c",
      onPrimary: "#1a1a1a",
      accent: "#ffb199",
      radiusCard: "12px",
      radiusButton: "10px",
    },
  },
  {
    id: "seafood",
    label: "غذاهای دریایی",
    description: "آبی عمیق اقیانوس با رنگ مرجانی",
    suggestedFor: "seafood",
    mode: "dark",
    tokens: {
      bg: "#0b1f2e",
      surface: "#12324a",
      surfaceAlt: "#184058",
      text: "#eaf6fb",
      textMuted: "#9cc3d6",
      border: "#1f5170",
      primary: "#2ec4b6",
      onPrimary: "#06222a",
      accent: "#ff8f6b",
      radiusCard: "14px",
      radiusButton: "10px",
    },
  },
  {
    id: "fastfood",
    label: "فست فود",
    description: "روشن و پرانرژی با قرمز و زرد، دکمه‌های گرد",
    suggestedFor: "fastfood",
    mode: "light",
    tokens: {
      bg: "#fff4d6",
      surface: "#ffffff",
      surfaceAlt: "#ffe9b0",
      text: "#2b1408",
      textMuted: "#7a5a45",
      border: "#f2d28b",
      primary: "#e5251b",
      onPrimary: "#ffffff",
      accent: "#d97706",
      radiusCard: "18px",
      radiusButton: "999px",
    },
  },
  {
    id: "beach",
    label: "ساحلی",
    description: "شنی و روشن با فیروزه‌ای دریا و نارنجی غروب",
    suggestedFor: "seafood",
    mode: "light",
    tokens: {
      bg: "#fdf3e1",
      surface: "#ffffff",
      surfaceAlt: "#fbe6c4",
      text: "#1c3b4a",
      textMuted: "#5f7d8a",
      border: "#efd9b4",
      primary: "#087f90",
      onPrimary: "#ffffff",
      accent: "#e8603c",
      radiusCard: "16px",
      radiusButton: "12px",
    },
  },
  {
    id: "traditional",
    label: "سنتی",
    description: "قهوه‌ای گرم با طلایی و فیروزه‌ای ایرانی",
    suggestedFor: "traditional",
    mode: "dark",
    tokens: {
      bg: "#2a140e",
      surface: "#3a1d14",
      surfaceAlt: "#47251a",
      text: "#f6e7cf",
      textMuted: "#c9a98a",
      border: "#5c3526",
      primary: "#c9962f",
      onPrimary: "#2a140e",
      accent: "#3fb2a4",
      radiusCard: "6px",
      radiusButton: "4px",
    },
  },
  {
    id: "italian",
    label: "ایتالیایی",
    description: "کرم گرم با قرمز گوجه و سبز ریحان",
    suggestedFor: "italian",
    mode: "light",
    tokens: {
      bg: "#f6f0e4",
      surface: "#fffdf8",
      surfaceAlt: "#efe6d2",
      text: "#2a2a22",
      textMuted: "#6e6a5a",
      border: "#ddd2b8",
      primary: "#b8231f",
      onPrimary: "#ffffff",
      accent: "#2f6b3a",
      radiusCard: "8px",
      radiusButton: "6px",
    },
  },
  {
    id: "asian",
    label: "چینی / آسیایی",
    description: "قرمز لاکی و طلایی روی زمینه تیره",
    suggestedFor: "asian",
    mode: "dark",
    tokens: {
      bg: "#160d0d",
      surface: "#241414",
      surfaceAlt: "#301a1a",
      text: "#f7ebe0",
      textMuted: "#c4a89a",
      border: "#4a2626",
      primary: "#d62828",
      onPrimary: "#ffffff",
      accent: "#f2b134",
      radiusCard: "4px",
      radiusButton: "4px",
    },
  },
  {
    id: "cafe",
    label: "کافه",
    description: "روشن و آرام با قهوه‌ای لاته",
    suggestedFor: "cafe",
    mode: "light",
    tokens: {
      bg: "#efe6dc",
      surface: "#fbf7f2",
      surfaceAlt: "#e3d5c6",
      text: "#3b2a20",
      textMuted: "#7d6757",
      border: "#d6c4b2",
      primary: "#6f4a34",
      onPrimary: "#ffffff",
      accent: "#b0703c",
      radiusCard: "16px",
      radiusButton: "12px",
    },
  },
  {
    id: "garden",
    label: "باغ رستوران",
    description: "سبز جنگلی با لهجه‌ی زرد",
    suggestedFor: "garden",
    mode: "dark",
    tokens: {
      bg: "#0f2416",
      surface: "#17331f",
      surfaceAlt: "#1e3f28",
      text: "#ecf6e9",
      textMuted: "#9fc4a3",
      border: "#2a5436",
      primary: "#8bc34a",
      onPrimary: "#0f2416",
      accent: "#f4d35e",
      radiusCard: "16px",
      radiusButton: "12px",
    },
  },
  {
    id: "dessert",
    label: "شیرینی و بستنی",
    description: "صورتی ملایم با بنفش، گوشه‌های کاملا گرد",
    suggestedFor: "cafe",
    mode: "light",
    tokens: {
      bg: "#fff0f5",
      surface: "#ffffff",
      surfaceAlt: "#ffe0ec",
      text: "#4a1d33",
      textMuted: "#8f5a74",
      border: "#f6c9db",
      primary: "#d6336c",
      onPrimary: "#ffffff",
      accent: "#7950f2",
      radiusCard: "22px",
      radiusButton: "999px",
    },
  },
];

const THEME_MAP = Object.fromEntries(THEMES.map((t) => [t.id, t]));

/** Always returns a valid theme (falls back to the default for unknown ids). */
export function getTheme(id) {
  return THEME_MAP[id] ?? THEME_MAP[DEFAULT_THEME_ID];
}

const VAR_NAMES = {
  bg: "--rt-bg",
  surface: "--rt-surface",
  surfaceAlt: "--rt-surface-alt",
  text: "--rt-text",
  textMuted: "--rt-text-muted",
  border: "--rt-border",
  primary: "--rt-primary",
  onPrimary: "--rt-on-primary",
  accent: "--rt-accent",
  radiusCard: "--rt-radius-card",
  radiusButton: "--rt-radius-button",
};

/** Returns { "--rt-bg": "#...", ... }. Use it as a React `style` object. */
export function themeToCssVars(themeOrId) {
  const theme =
    typeof themeOrId === "string" || themeOrId == null
      ? getTheme(themeOrId)
      : themeOrId;

  return Object.fromEntries(
    Object.entries(VAR_NAMES).map(([key, cssVar]) => [cssVar, theme.tokens[key]]),
  );
}

/**
 * Applies a theme to a DOM element (e.g. the restaurant page root).
 * Returns a cleanup function, so it can be returned directly from useEffect.
 */
export function applyTheme(el, themeId) {
  if (!el) return undefined;
  const vars = themeToCssVars(themeId);
  Object.entries(vars).forEach(([name, value]) => el.style.setProperty(name, value));
  return () => Object.keys(vars).forEach((name) => el.style.removeProperty(name));
}
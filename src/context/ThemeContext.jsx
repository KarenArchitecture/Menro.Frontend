// src/context/ThemeContext.jsx
// Single source of truth for light / dark mode.
//
// - The theme is stored as a class on <html>:  theme-dark  |  theme-light
//   (every light-mode rule in theme.css starts with  html.theme-light ...)
// - The choice is saved in localStorage so it survives reloads.
// - The inline script in index.html sets the class BEFORE React starts,
//   so there is no dark -> light flash on load.
// - Some pages have their own design and must never change with the switch
//   (see THEME_EXCLUDED_* below). On those pages <html> is forced to
//   theme-dark; the saved choice is kept and re-applied everywhere else.
//
// NOTE: <ThemeProvider> must be rendered INSIDE the router (it uses useLocation).
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

export const THEME_STORAGE_KEY = "menro-theme";

/* ---------------------------------------------------------------
   PAGES THAT IGNORE LIGHT / DARK MODE
   "/" (landing) is matched exactly; the others match by prefix:
     "/blog" also covers /blog/:slug and /blogresult
   Add or remove entries here. Keep the same list in the index.html script.
   --------------------------------------------------------------- */
const THEME_EXCLUDED_EXACT = ["/"];
const THEME_EXCLUDED_PREFIXES = ["/landing", "/blog", "/subscriptions"];

export function isThemeExcluded(pathname) {
  return (
    THEME_EXCLUDED_EXACT.includes(pathname) ||
    THEME_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

// colour of the browser / status bar on phones
const BROWSER_BAR_COLOR = { dark: "#0c0f14", light: "#ededed" };

const ThemeContext = createContext({
  theme: "dark",
  isLight: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark"; // storage blocked (private mode, etc.)
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("theme-light", theme === "light");
  root.classList.toggle("theme-dark", theme !== "light");

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = BROWSER_BAR_COLOR[theme] ?? BROWSER_BAR_COLOR.dark;
}

export function ThemeProvider({ children }) {
  const { pathname } = useLocation();
  const [theme, setThemeState] = useState(readStoredTheme);

  // what is actually painted: the user's choice, except on excluded pages
  const appliedTheme = isThemeExcluded(pathname) ? "dark" : theme;

  // layout effect = runs before paint, so there is no light flash when
  // navigating to / from an excluded page
  useLayoutEffect(() => {
    applyTheme(appliedTheme);
  }, [appliedTheme]);

  const setTheme = useCallback((next) => {
    const value = next === "light" ? "light" : "dark";
    setThemeState(value);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, isLight: theme === "light", setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
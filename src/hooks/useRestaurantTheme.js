// src/hooks/useRestaurantTheme.js
//
// Applies the restaurant's colour theme to <html> while the calling component
// is mounted, and removes it on unmount.
//
//   useRestaurantTheme("admin");   // call ONCE in AdminPage (always mounted)
//   useRestaurantTheme("shop");    // later: restaurant page (needs shop CSS)
//
// Where the theme comes from (see pickEffectiveInput in restaurantThemes.js):
//   live preview (picker)  >  DEV localStorage draft  >  saved value
//
// BACKEND HOOK-UP: wherever the restaurant is fetched, call
//   restaurantThemeStore.setSaved(restaurant.themeId ?? restaurant.theme ?? null)
// (or pass the value as the 2nd argument here). Nothing else is needed.

import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  restaurantThemeStore,
  pickEffectiveInput,
  resolveRestaurantTheme,
  applyRestaurantTheme,
} from "../theme/restaurantThemes";

import "../assets/css/admin/restaurant-theme.css";

export default function useRestaurantTheme(scope = "admin", savedFromProps) {
  const snap = useSyncExternalStore(
    restaurantThemeStore.subscribe,
    restaurantThemeStore.getSnapshot,
  );

  const input = pickEffectiveInput(snap, savedFromProps);
  const key = JSON.stringify(input ?? null); // stable even if input is an object
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const theme = useMemo(() => resolveRestaurantTheme(input), [key]);

  useEffect(() => applyRestaurantTheme(scope, theme), [scope, theme]);

  return theme;
}
// src/api/ownerTheme.js
//
// API layer for the restaurant theme.
//
// BACKEND CONTRACT (proposed; change freely, only this file needs to follow):
//   GET /theme  -> { "themeId": "seafood" }      (themeId may be null if never chosen)
//   PUT /theme  <- { "themeId": "seafood" }      -> { "themeId": "seafood" }
//
// Paths are relative to ownerRestaurantAxios' baseURL (same as "/context").
// Valid ids are the `id` values in src/themes/restaurantThemes.js.
//
// While the backend does not exist, keep THEME_API_ENABLED = false:
// the tab works fully in the UI, and saving just logs the payload.
// When the endpoints are ready, set it to true. Nothing else changes.

import ownerRestaurantAxios from "./ownerRestaurantAxios";

const THEME_API_ENABLED = false;

export async function getOwnerTheme() {
  if (!THEME_API_ENABLED) return { themeId: null };

  const { data } = await ownerRestaurantAxios.get("/theme");
  return data;
}

export async function saveOwnerTheme(themeId) {
  if (!THEME_API_ENABLED) {
    console.info("[theme] save (mock):", { themeId });
    return { themeId };
  }

  const { data } = await ownerRestaurantAxios.put("/theme", { themeId });
  return data;
}
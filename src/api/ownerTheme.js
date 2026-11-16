// src/api/ownerTheme.js
import ownerThemeAxios from "./ownerThemeAxios";
import publicAxios from "./publicAxios";

/** GET /restaurant/theme -> { themeId: number | null } */
export async function getOwnerTheme() {
  const { data } = await ownerThemeAxios.get("");
  return data;
}

/** PUT /restaurant/theme body: { themeId: number } */
export async function saveOwnerTheme(themeId) {
  const { data } = await ownerThemeAxios.put("", { themeId });
  return data;
}

/** GET /public/restaurant/themes -> active platform themes */
export async function getActiveRestaurantThemes() {
  const { data } = await publicAxios.get("/restaurant/themes");
  return Array.isArray(data) ? data : [];
}

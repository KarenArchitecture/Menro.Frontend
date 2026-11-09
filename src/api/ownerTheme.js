// src/api/ownerTheme.js
import ownerThemeAxios from "./ownerThemeAxios";

/** GET /restaurant/theme → { themeId: string | null } */
export async function getOwnerTheme() {
  const { data } = await ownerThemeAxios.get("");
  return data;
}

/** PUT /restaurant/theme  body: { themeId } */
export async function saveOwnerTheme(themeId) {
  const { data } = await ownerThemeAxios.put("", { themeId });
  return data;
}

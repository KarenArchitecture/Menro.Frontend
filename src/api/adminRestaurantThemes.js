import adminRestaurantThemesAxios from "./adminRestaurantThemesAxios";

/**
 * GET /admin/restaurant-themes
 * Returns every platform theme, including inactive themes.
 */
export async function getAdminRestaurantThemes() {
  const { data } = await adminRestaurantThemesAxios.get("");
  return Array.isArray(data) ? data : [];
}

/** POST /admin/restaurant-themes */
export async function createAdminRestaurantTheme(theme) {
  const { data } = await adminRestaurantThemesAxios.post("", theme);
  return data;
}

/** PUT /admin/restaurant-themes/{id} */
export async function updateAdminRestaurantTheme(id, theme) {
  const { data } = await adminRestaurantThemesAxios.put("/" + id, theme);
  return data;
}

/**
 * PATCH /admin/restaurant-themes/{id}/active
 * The backend action binds a raw JSON boolean, not an { active } object.
 */
export async function setAdminRestaurantThemeActive(id, active) {
  const { data } = await adminRestaurantThemesAxios.patch(
    "/" + id + "/active",
    JSON.stringify(Boolean(active)),
    { headers: { "Content-Type": "application/json" } },
  );
  return data;
}

/** DELETE /admin/restaurant-themes/{id} */
export async function deleteAdminRestaurantTheme(id) {
  const { data } = await adminRestaurantThemesAxios.delete("/" + id);
  return data;
}

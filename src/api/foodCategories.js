// src/api/foodCategories.js
import publicAxios from "./publicAxios";

/* ───────────────  🍽 Shop Page: Restaurant Categories ─────────────── */
export const getRestaurantCategoriesBySlug = (slug) =>
    publicAxios.get(`/restaurant/${slug}/categories`).then((r) => r.data);

// src/api/foodCategories.js
import publicAxios from "./publicAxios";



/* ───────────────  🍽 Shop Page ─────────────── */

export const getRestaurantCategoriesBySlug = (slug) =>
    publicAxios.get(`foodcategory/${slug}`).then(r => r.data);
// src/api/restaurants.js
import publicAxios from "./publicAxios";
import restaurantAxios from "./restaurantAxios";

const RESTAURANT_URL = "/restaurant";

/* ────────────────────────────────
  🍽 PUBLIC RESTAURANT DATA
──────────────────────────────── */

/* ───────────────  🏠 Home Page  ─────────────── */

export const getRestaurantsPage = ({ take = 20, cursor = null }) =>
  publicAxios
    .get(`${RESTAURANT_URL}`, { params: { take, cursor } })
    .then((r) => r.data);

// ── Random Restaurant Cards ──
export const getRandomRestaurants = () =>
  publicAxios.get(`${RESTAURANT_URL}/random`).then((r) => r.data);


/* ───────────────  🛍 Shop Page  ─────────────── */
export const getRestaurantBannerBySlug = (slug) =>
  publicAxios.get(`${RESTAURANT_URL}/${slug}/banner`).then((r) => r.data);

/* ───────────────  🍴 Restaurant Page (Dynamic Menu & Item Detail) ─────────────── */

export const getRestaurantMenuBySlug = (restaurantSlug) =>
  publicAxios
    .get(`${RESTAURANT_URL}/${restaurantSlug}/menu`)
    .then((r) => r.data);

export const getFoodDetail = (foodId) =>
  publicAxios.get(`${RESTAURANT_URL}/${foodId}/details`).then((r) => r.data);

/* ───────────────  ⚙️ Owner/Admin Utilities  ─────────────── */
export const getFoodCategoriesByRestaurantSlug = (slug) =>
  publicAxios
    .get(`${RESTAURANT_URL}/${slug}/foodcategories`)
    .then((r) => r.data);

export const fetchRestaurantCategories = async () => {
  const response = await restaurantAxios.get("/categories");
  return response.data;
};

/* ───────────────  🧾 Registration  ─────────────── */
export const registerRestaurant = async (payload) => {
  const token = localStorage.getItem("accessToken");

  const response = await restaurantAxios.post("/register", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

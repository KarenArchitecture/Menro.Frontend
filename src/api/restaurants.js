// src/api/restaurants.js
import publicAxios from "./publicAxios";
import userAxios from "./userAxios";
import restaurantAxios from "./restaurantAxios";

const RESTAURANT_URL = "/restaurant"; // all routes below share this prefix

/* ───────────────  🍽 public restaurant data ─────────────── */

export const getFeaturedRestaurants = () =>
  publicAxios.get(`${RESTAURANT_URL}/featured`).then((r) => r.data);
export const getRandomRestaurants = () =>
  publicAxios.get(`${RESTAURANT_URL}/random`).then((r) => r.data);
export const getAdBanner = () =>
  publicAxios.get(`${RESTAURANT_URL}/ad-banner`).then((r) => r.data);
export const getRandomAdBanner = (excludeIds = []) =>
  publicAxios.get(`/restaurant/ad-banner/random`, {params: { exclude: excludeIds.length ? excludeIds.join(",") : undefined },})
  .then((r)=>r.data);
export const postAdImpression = (bannerId) =>
  publicAxios.post(`/restaurant/ad-banner/${bannerId}/impression`);
export const getRestaurantBannerBySlug = (slug) =>
  publicAxios.get(`${RESTAURANT_URL}/${slug}/banner`).then((r) => r.data);
export const getRestaurantMenuBySlug = (slug) =>
  publicAxios.get(`${RESTAURANT_URL}/${slug}/menu`).then((r) => r.data);
export const getFoodCategoriesByRestaurantSlug = (slug) =>
  publicAxios
    .get(`${RESTAURANT_URL}/${slug}/foodcategories`)
    .then((r) => r.data);

/* ───────────────  👤 user-specific  ─────────────── */
export const getUserRecentOrders = (count = 8) =>
  userAxios.get(`/restaurant/recent-orders?count=${count}`).then(r => r.data);

// ========================
// 🍔 Public Food APIs
// ========================

export const getPopularFoodByRandomCategory = async () => {
  const response = await publicAxios.get(
    `${FOOD_URL}/popular-by-category-random`
  );
  return response.data;
};

// =========================
// 👤 User-specific APIs
// =========================

// =========================
// Restaurant Registration
// =========================
// get categories
export const fetchRestaurantCategories = async () => {
  const response = await restaurantAxios.get("/categories");
  return response.data;
};

// restaurant registeration
export const registerRestaurant = async (payload) => {
  // const token = localStorage.getItem("token");
  const token = localStorage.getItem("token");
  const response = await restaurantAxios.post("/register", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

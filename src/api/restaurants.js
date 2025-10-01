// src/api/restaurants.js
import publicAxios from "./publicAxios";
import restaurantAxios from "./restaurantAxios";

const RESTAURANT_URL = "/restaurant";

/* ───────────────  🍽 public restaurant data ─────────────── */
/* ───────────────  🍽 Home Page ─────────────── */
export const getFeaturedRestaurants = () =>
  publicAxios.get(`${RESTAURANT_URL}/featured`).then(r => r.data);

export const getRandomRestaurants = () =>
  publicAxios.get(`${RESTAURANT_URL}/random`).then(r => r.data);

// Ad banners
export const getAdBanner = () =>
  publicAxios.get(`${RESTAURANT_URL}/ad-banner`).then(r => r.data);

export const getRandomAdBanner = (excludeIds = []) =>
  publicAxios
    .get(`${RESTAURANT_URL}/ad-banner/random`, { params: { exclude: excludeIds.length ? excludeIds.join(",") : undefined },})
    .then(r => r.data);

export const postAdImpression = (bannerId) =>
  publicAxios.post(`${RESTAURANT_URL}/ad-banner/${bannerId}/impression`);

/* ───────────────  🍽 Shop Page ─────────────── */
export const getRestaurantBannerBySlug = (slug) =>
  publicAxios.get(`${RESTAURANT_URL}/${slug}/banner`).then(r => r.data);

export const getRestaurantMenuBySlug = (slug) =>
  publicAxios.get(`${RESTAURANT_URL}/${slug}/menu`).then(r => r.data);

// Owner/admin utilities (keep as-is)
export const getFoodCategoriesByRestaurantSlug = (slug) =>
  publicAxios.get(`${RESTAURANT_URL}/${slug}/foodcategories`).then(r => r.data);

export const fetchRestaurantCategories = async () => {
  const response = await restaurantAxios.get("/categories");
  return response.data;
};

// =========================
// Restaurant Registration
// =========================
export const registerRestaurant = async (payload) => {
  const token = localStorage.getItem("token");
  const response = await restaurantAxios.post("/register", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


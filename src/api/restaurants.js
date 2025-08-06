// // src/api/restaurants.js
// import publicAxios from "./publicAxios";
// //mport userAxios from "../api/userAxios";
// import { fakeUser } from "../Constants/fakeAuth"; // 👈 import fake user

// // 📍 Base route prefixes
// const PUBLIC_URL = "/restaurant";
// const USER_URL = "/restaurant";
// const FOOD_URL = "/food";

// // =========================
// // 🍽 Public Restaurant APIs
// // =========================

// export const getFeaturedRestaurants = async () => {
//   const response = await publicAxios.get(`${PUBLIC_URL}/featured`);
//   return response.data;
// };

// export const getRandomRestaurants = async () => {
//   const response = await publicAxios.get(`${PUBLIC_URL}/random`);
//   return response.data;
// };

// export const getAdBanner = async () => {
//   const response = await publicAxios.get(`${PUBLIC_URL}/ad-banner`);
//   return response.data;
// };

// export const getRestaurantBannerBySlug = async (slug) => {
//   const response = await publicAxios.get(`${PUBLIC_URL}/banner/${slug}`);
//   return response.data;
// };

// // ✅ Get restaurant menu by slug
// export const getRestaurantMenuBySlug = async (slug) => {
//     const response = await publicAxios.get(`${FOOD_URL}/restaurant/${slug}/menu`);
//     return response.data;
// };

// // ========================
// // 🍔 Public Food APIs
// // ========================

// export const getPopularFoodByRandomCategory = async () => {
//   const response = await publicAxios.get(
//     `${FOOD_URL}/popular-by-category-random`
//   );
//   return response.data;
// };

// // =========================
// // 👤 User-specific APIs
// // =========================

// // ✅ FAKE recent orders (bypass auth)
// export const getUserRecentOrders = async () => {
//   const response = await publicAxios.get(
//     `/restaurant/recent-orders/${fakeUser.id}`
//   );
//   return response.data;
// };


// src/api/restaurants.js
import publicAxios from "./publicAxios";
import { fakeUser } from "../Constants/fakeAuth";

const RESTAURANT_URL = "/restaurant";   // all routes below share this prefix

/* ───────────────  🍽 public restaurant data ─────────────── */

export const getFeaturedRestaurants      = () => publicAxios.get(`${RESTAURANT_URL}/featured`).then(r => r.data);
export const getRandomRestaurants        = () => publicAxios.get(`${RESTAURANT_URL}/random`).then(r => r.data);
export const getAdBanner                 = () => publicAxios.get(`${RESTAURANT_URL}/ad-banner`).then(r => r.data);
export const getRestaurantBannerBySlug   = (slug) => publicAxios.get(`${RESTAURANT_URL}/${slug}/banner`).then(r => r.data);
export const getRestaurantMenuBySlug     = (slug) => publicAxios.get(`${RESTAURANT_URL}/${slug}/menu`).then(r => r.data);
export const getFoodCategoriesByRestaurantSlug = (slug) => publicAxios.get(`${RESTAURANT_URL}/${slug}/foodcategories`).then(r => r.data);

/* ───────────────  👤 user-specific (fake)  ─────────────── */

export const getUserRecentOrders = () => publicAxios.get(`${RESTAURANT_URL}/recent-orders/${fakeUser.id}`).then(r => r.data);
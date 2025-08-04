// src/api/restaurants.js
//import userAxios from "../api/userAxios";
import restaurantAxios from "./restaurantAxios";
import { fakeUser } from "../Constants/fakeAuth"; // 👈 import fake user

// 📍 Base route prefixes
const PUBLIC_URL = "/restaurant";
const USER_URL = "/restaurant";
const FOOD_URL = "/food";

// =========================
// 🍽 Public Restaurant APIs
// =========================

export const getFeaturedRestaurants = async () => {
  const response = await publicAxios.get(`${PUBLIC_URL}/featured`);
  return response.data;
};

export const getRandomRestaurants = async () => {
  const response = await publicAxios.get(`${PUBLIC_URL}/random`);
  return response.data;
};

export const getAdBanner = async () => {
  const response = await publicAxios.get(`${PUBLIC_URL}/ad-banner`);
  return response.data;
};

export const getRestaurantBannerBySlug = async (slug) => {
  const response = await publicAxios.get(`${PUBLIC_URL}/banner/${slug}`);
  return response.data;
};

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

// ✅ FAKE recent orders (bypass auth)
export const getUserRecentOrders = async () => {
  const response = await publicAxios.get(
    `/restaurant/recent-orders/${fakeUser.id}`
  );
  return response.data;
};

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
  const token = localStorage.getItem("token");

  const response = await restaurantAxios.post("/register", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

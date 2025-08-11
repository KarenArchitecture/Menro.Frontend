// // src/api/foods.js
// import axiosClient from "./publicAxios";

// // 📍 Base route prefix
// const FOOD_URL = "/food"; // base path is already /api/public in axiosClient

// // ✅ Get popular foods from a random category (no exclusions)
// export const getPopularFoodByRandomCategory = async () => {
//     const response = await axiosClient.get(`${FOOD_URL}/popular-by-category-random`);
//     return response.data;
// };

// // ✅ Get popular foods from a random category excluding used categories
// // usedCategories is an array of category title strings
// export const getPopularFoodByRandomCategoryExcluding = async (usedCategories = []) => {
//     const response = await axiosClient.post(`${FOOD_URL}/popular-by-category-random`, usedCategories);
//     return response.data;
// };



// src/api/foods.js
import publicAxios from "./publicAxios";

const FOOD_URL = "/food";

/* Popular-food widgets on Home screen */
export const getPopularFoodByRandomCategory = () => publicAxios.get(`${FOOD_URL}/popular-by-category-random`).then(r => r.data);

export const getPopularFoodByRandomCategoryExcluding = (usedTitles = []) => publicAxios.post(`${FOOD_URL}/popular-by-category-random`, usedTitles).then(r => r.data);
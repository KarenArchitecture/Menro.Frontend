// src/api/foods.js
import publicAxios from "./publicAxios";

// Popular foods by a random category (homepage lazy rows)
export const getPopularFoodByRandomCategory = () =>
    publicAxios.get("/food/popular-foods").then(r => r.data);

export const getPopularFoodByRandomCategoryExcluding = (excludeTitles = []) =>
    publicAxios.post("/food/popular-foods-excluding", excludeTitles).then(r => r.data);

// Random popular foods
// export const getRandomPopularFoods = (count = 8) =>
//     publicAxios.get(`/food/popular-foods?count=${count}`).then(r => r.data);

// // Random excluding some categories
// export const getRandomPopularFoodsExcluding = (usedCategories) =>
//     publicAxios.post(`/food/popular-foods-excluding`, usedCategories).then(r => r.data);


// src/api/foods.js
import publicAxios from "./publicAxios";
export const getPopularFoodByRandomCategory = () => 
    publicAxios.get("/food/popular-by-category-random").then(r => r.data);

export const getPopularFoodByRandomCategoryExcluding = (excludeTitles) =>
    publicAxios.post("/food/popular-by-category-random", excludeTitles ?? []).then(r => r.data);
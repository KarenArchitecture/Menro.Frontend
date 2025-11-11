// src/api/foods.js
import publicAxios from "./publicAxios";

// Popular foods by a random category (homepage lazy rows)
export const getPopularFoodByRandomCategory = () =>
    publicAxios.get("/food/popular").then(r => r.data);

export const getPopularFoodByRandomCategoryExcluding = (excludeTitles = []) =>
    publicAxios.post("/food/popular-foods-excluding", excludeTitles).then(r => r.data);
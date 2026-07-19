// src/api/adminCombos.js
import adminCombosAxios from "./adminCombosAxios";

// Returns an array of foodIds currently linked as combos for this food
export const getCombosForFood = (foodId) =>
    adminCombosAxios.get(`/${foodId}`).then((r) => r.data);

// Replaces the full combo set for this food
export const setCombosForFood = (foodId, comboFoodIds) =>
    adminCombosAxios
        .put(`/${foodId}`, { comboFoodIds })
        .then((r) => r.data);
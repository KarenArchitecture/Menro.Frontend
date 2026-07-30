// src/api/adminCombos.js
import adminCombosAxios from "./adminCombosAxios";

export const getCombosForFood = (foodId) =>
    adminCombosAxios.get(`/${foodId}`).then((r) => r.data);

export const setCombosForFood = (foodId, comboFoodIds) =>
    adminCombosAxios.put(`/${foodId}`, { comboFoodIds }).then((r) => r.data);

export const getComboCounts = () =>
    adminCombosAxios.get(`/counts`).then((r) => r.data);
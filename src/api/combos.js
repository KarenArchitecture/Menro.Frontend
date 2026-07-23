// src/api/combos.js
import publicAxios from "./publicAxios";

export const getFoodCombos = (foodId) =>
    publicAxios.get(`/restaurant/${foodId}/combos`).then((r) => r.data);
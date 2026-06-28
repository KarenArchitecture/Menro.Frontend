import userAxios from "./userAxios";

/* ────────────────────────────────
    FAVORITES (USER)
──────────────────────────────── */

export const toggleFavoriteFood = (foodId) =>
    userAxios.post(`/favorites/${foodId}`);

export const getUserFavorites = () =>
    userAxios.get(`/favorites`).then((r) => r.data);

export const getFavoriteFoodIds = () =>
    userAxios.get("/favorites/ids").then((r) => r.data);
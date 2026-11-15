import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminRestaurantThemesAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/restaurant-themes`,
  requireAuth: true,
});

export default adminRestaurantThemesAxios;

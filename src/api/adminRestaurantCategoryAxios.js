import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminRestaurantCategoryAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/restaurant-categories`,
  requireAuth: true,
});

export default adminRestaurantCategoryAxios;

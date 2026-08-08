import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminRestaurantAdAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/ads`,
  requireAuth: true,
});

export default adminRestaurantAdAxios;

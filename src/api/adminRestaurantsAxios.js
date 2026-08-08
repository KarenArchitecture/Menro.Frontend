import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminRestaurantsAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/restaurants`,
  requireAuth: true,
});

export default adminRestaurantsAxios;

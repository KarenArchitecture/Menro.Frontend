import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminFoodAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/food`,
  requireAuth: true,
});

export default adminFoodAxios;

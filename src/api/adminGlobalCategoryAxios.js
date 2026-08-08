import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminGlobalCategoryAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/adminpanel/globalFoodCategory`,
  requireAuth: true,
});

export default adminGlobalCategoryAxios;

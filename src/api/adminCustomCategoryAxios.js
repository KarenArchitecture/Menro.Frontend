import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminCustomCategoryAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/adminpanel/customFoodCategory`,
  requireAuth: true,
});

export default adminCustomCategoryAxios;

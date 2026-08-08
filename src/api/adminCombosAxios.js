import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminCombosAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/adminpanel/foodcombo`,
  requireAuth: true,
});

export default adminCombosAxios;

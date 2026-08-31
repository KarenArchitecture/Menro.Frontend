import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminSiteMenuAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/menu-items`,
  requireAuth: true,
});

export default adminSiteMenuAxios;

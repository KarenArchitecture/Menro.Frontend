import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminSiteLinkAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/site-links`,
  requireAuth: true,
});

export default adminSiteLinkAxios;

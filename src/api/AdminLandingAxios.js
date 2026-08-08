import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminLandingAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/landing`,
  requireAuth: true,
});

export default adminLandingAxios;

import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminDashboardAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/dashboard`,
  requireAuth: true,
});

export default adminDashboardAxios;

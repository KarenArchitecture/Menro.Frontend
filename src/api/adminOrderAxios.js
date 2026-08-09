import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminOrderAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/orders`,
  requireAuth: true,
});

export default adminOrderAxios;

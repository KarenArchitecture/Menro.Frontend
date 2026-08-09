import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminUsersAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/users`,
  requireAuth: true,
});

export default adminUsersAxios;

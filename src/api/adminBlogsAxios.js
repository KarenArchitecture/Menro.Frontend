import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminBlogsAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/blog`,
  requireAuth: true,
});

export default adminBlogsAxios;

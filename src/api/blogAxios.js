import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const blogAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/public/blog`,
  requireAuth: true,
});

export default blogAxios;

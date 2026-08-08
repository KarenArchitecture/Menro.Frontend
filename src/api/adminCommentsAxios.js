import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminCommentsAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/comment`,
  requireAuth: true,
});

export default adminCommentsAxios;

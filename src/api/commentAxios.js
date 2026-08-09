import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const commentAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/user/comment`,
  requireAuth: true,
});

export default commentAxios;

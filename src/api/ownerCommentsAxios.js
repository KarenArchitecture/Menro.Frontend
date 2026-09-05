import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const ownerCommentsAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/owner/comment`,
  requireAuth: true,
});

export default ownerCommentsAxios;
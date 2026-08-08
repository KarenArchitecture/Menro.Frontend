import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const iconAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/icon`,
  requireAuth: true,
});

export default iconAxios;

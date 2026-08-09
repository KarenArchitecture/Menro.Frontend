import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const authAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
  requireAuth: true,
});

export default authAxios;

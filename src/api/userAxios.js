import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const userAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/user`,
  requireAuth: true,
});

export default userAxios;

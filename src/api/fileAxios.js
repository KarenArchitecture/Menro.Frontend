import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const fileAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/file`,
  requireAuth: true,
});

export default fileAxios;

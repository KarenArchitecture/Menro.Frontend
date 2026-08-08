import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

// admin/* endpoints — auth required
const apiClient = createAuthenticatedAxios({
  baseURL: import.meta.env.VITE_API_URL,
  requireAuth: true,
});

// public/* endpoints — guest-accessible, no forced logout on 401
const publicMusicAxios = createAuthenticatedAxios({
  baseURL: import.meta.env.VITE_API_URL,
  requireAuth: false,
});

export { apiClient, publicMusicAxios };
export default apiClient;

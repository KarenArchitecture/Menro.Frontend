// src/api/ownerThemeAxios.js
import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

// api/restaurant/theme — owner only, requires login
const ownerThemeAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/restaurant/theme`,
});

export default ownerThemeAxios;

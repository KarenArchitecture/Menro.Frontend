// src/api/siteLinkAxios.js
import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

// public/site-content/links endpoints — guest-accessible, no forced logout on 401
const siteLinkAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/site-content/links`,
  requireAuth: false,
});

export default siteLinkAxios;

import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adSettingsAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/adSettings`,
  requireAuth: true,
});

export default adSettingsAxios;

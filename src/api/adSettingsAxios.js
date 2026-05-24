import axios from "axios";

const adSettingsAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/adSettings`,
  withCredentials: true,
});

adSettingsAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adSettingsAxios;

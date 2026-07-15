import axios from "axios";

const adminLandingAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/landing`,
  withCredentials: true,
});

adminLandingAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminLandingAxios;

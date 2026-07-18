import axios from "axios";

const adminFoodAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/food`,
  withCredentials: true,
});

adminFoodAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminFoodAxios;

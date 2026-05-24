// src/api/adminRestaurantAdAxios.js
import axios from "axios";

const adminRestaurantAdAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/ads`,
  withCredentials: true,
});
adminRestaurantAdAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminRestaurantAdAxios;

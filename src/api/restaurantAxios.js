// src/api/restaurantAxios.js
import axios from "axios";

const restaurantAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/public/restaurant`,
  withCredentials: true,
});
restaurantAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default restaurantAxios;

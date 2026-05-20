// src/api/ownerRestaurantAxios.js
import axios from "axios";

const ownerRestaurantAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/owner/restaurant`,
  withCredentials: true,
});

ownerRestaurantAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default ownerRestaurantAxios;

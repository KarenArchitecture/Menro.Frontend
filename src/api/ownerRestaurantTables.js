// src/api/ownerRestaurantTables.js
import axios from "axios";

const ownerRestaurantTables = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/owner/restaurant/tables`,
  withCredentials: true,
});

ownerRestaurantTables.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default ownerRestaurantTables;

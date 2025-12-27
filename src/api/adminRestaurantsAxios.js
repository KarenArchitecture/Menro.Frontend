// src/api/adminRestaurantsAxios.js
import axios from "axios";

const adminRestaurantsAxios = axios.create({
  baseURL: "https://localhost:7270/api/admin/restaurants",
  withCredentials: true,
});
adminRestaurantsAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminRestaurantsAxios;

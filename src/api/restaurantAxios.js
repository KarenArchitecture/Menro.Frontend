// src/api/authAxios.js
import axios from "axios";

const restaurantAxios = axios.create({
  baseURL: "https://localhost:7270/api/public/restaurant",
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

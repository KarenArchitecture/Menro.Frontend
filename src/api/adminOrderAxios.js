// src/api/adminOrderAxios.js
import axios from "axios";

const adminOrderAxios = axios.create({
  baseURL: "https://localhost:7270/api/admin/orders",
  withCredentials: true,
});
adminOrderAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminOrderAxios;

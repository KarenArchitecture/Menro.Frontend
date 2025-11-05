// src/api/authAxios.js
import axios from "axios";

const authAxios = axios.create({
  baseURL: "https://localhost:7270/api/auth",
  withCredentials: true,
});

// ✅ interceptor برای افزودن توکن به هر درخواست
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default authAxios;

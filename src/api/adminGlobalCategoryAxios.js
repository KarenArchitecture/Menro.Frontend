// src/api/adminGlobalFoodCategory.js
import axios from "axios";

const adminGlobalCategoryAxios = axios.create({
  baseURL: "https://localhost:7270/api/adminpanel/globalFoodCategory",
  withCredentials: true,
});
// افزودن توکن JWT به تمام درخواست‌ها
adminGlobalCategoryAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // یا از هر جایی که ذخیره‌اش کردی
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default adminGlobalCategoryAxios;

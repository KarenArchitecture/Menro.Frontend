import axios from "axios";

const adminCustomCategoryAxios = axios.create({
  baseURL: "https://localhost:7270/api/adminpanel/customFoodCategory",
  withCredentials: true, // اگه از Identity Cookie هم استفاده بشه، این لازمه
});

// افزودن توکن JWT به تمام درخواست‌ها
adminCustomCategoryAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // یا از هر جایی که ذخیره‌اش کردی
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminCustomCategoryAxios;

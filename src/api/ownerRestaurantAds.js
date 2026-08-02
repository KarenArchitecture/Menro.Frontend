// src/api/ownerRestaurantAds.js
import axios from "axios";

// ⚠️ فرض: VITE_API_URL از قبل شامل پیش‌وند "/api" هست (مثلاً https://example.com/api)
// چون کنترلر بک‌اند روی مسیر "api/restaurant-ads" تعریف شده.
// اگر VITE_API_URL شامل "/api" نیست، این خط را به شکل زیر تغییر بده:
//   baseURL: `${import.meta.env.VITE_API_URL}/api/restaurant-ads`
const ownerRestaurantAds = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/restaurant-ads`,
  withCredentials: true,
});

ownerRestaurantAds.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default ownerRestaurantAds;

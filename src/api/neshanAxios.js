// src/api/neshanAxios.js
import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

// پروکسی بک‌اند برای سرویس‌های نشان (جستجو / Reverse Geocoding).
// کلید سرویس نشان فقط سمت سرور نگهداری می‌شه.
const neshanAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/neshan`,
  requireAuth: true,
});

export default neshanAxios;

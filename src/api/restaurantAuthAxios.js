// src/api/restaurantAuthAxios.js
import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

// همون base که restaurantAxios (public) داره، ولی این یکی برای اندپوینت‌هایی
// که نیاز به توکن دارن (مثل my-status که وضعیت رستوران خودِ کاربر لاگین‌شده رو می‌ده)
const restaurantAuthAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/public/restaurant`,
  requireAuth: true,
});

export default restaurantAuthAxios;

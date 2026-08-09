// ⚠️ فرض: VITE_API_URL از قبل شامل پیش‌وند "/api" هست (مثلاً https://example.com/api)
// چون کنترلر بک‌اند روی مسیر "api/restaurant-ads" تعریف شده.
// اگر VITE_API_URL شامل "/api" نیست، این خط را به شکل زیر تغییر بده:
//   baseURL: `${import.meta.env.VITE_API_URL}/api/restaurant-ads`
import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const ownerRestaurantAds = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/restaurant-ads`,
  requireAuth: true,
});

export default ownerRestaurantAds;

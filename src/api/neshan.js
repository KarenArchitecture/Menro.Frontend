// src/api/neshan.js
// توابع جستجو و تشخیص آدرس، از طریق بک‌اند خودمون
import axios from "axios";
import neshanAxios from "./neshanAxios";

// تا وقتی اندپوینت‌های بک‌اند آماده نشدن، false بمونه
// (در .env: VITE_NESHAN_SEARCH_ENABLED=true)
export const isNeshanServiceEnabled =
  import.meta.env.VITE_NESHAN_SEARCH_ENABLED === "true";

// axios موقع abort خطای AbortError نمی‌ده؛ CanceledError می‌ده
export const isRequestCanceled = (err) => axios.isCancel(err);

/** GET /neshan/search → [{ title, address, lat, lng }] */
export async function searchPlaces(term, { lat, lng }, signal) {
  const res = await neshanAxios.get("/search", {
    params: { term, lat, lng },
    signal,
  });
  return res.data;
}

/** GET /neshan/reverse → { address } */
export async function reverseGeocode(lat, lng, signal) {
  const res = await neshanAxios.get("/reverse", {
    params: { lat, lng },
    signal,
  });
  return res.data?.address || null;
}

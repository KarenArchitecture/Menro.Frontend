// src/api/adminRestaurants.js
import adminRestaurantsAxios from "./adminRestaurantsAxios";

/* ---------------------------------------------------------------------
 * RestaurantRequestsPane — لیست درخواست‌های ثبت رستوران (تب "درخواست‌ها")
 * status: 1=Pending, 2=Approved, 3=Rejected
 * ------------------------------------------------------------------- */
export function getRestaurants(status) {
  return adminRestaurantsAxios.get("", {
    params: { status },
  });
}

export function updateRestaurantStatus(
  restaurantId,
  status,
  rejectReason = null,
) {
  return adminRestaurantsAxios.post("/status", {
    restaurantId,
    status,
    rejectReason,
  });
}

/* ---------------------------------------------------------------------
 * RestaurantsOverviewPane — لیست کامل رستوران‌ها (تب "لیست رستوران‌ها")
 * صفحه‌بندی و جستجوی سمت سرور
 * ------------------------------------------------------------------- */
export async function getRestaurantsOverview({
  search,
  page = 1,
  pageSize = 20,
} = {}) {
  const res = await adminRestaurantsAxios.get("/overview", {
    params: { search, page, pageSize },
  });
  return res.data; // { items, totalCount, totalPages, page }
}

/* ---------------------------------------------------------------------
 * RestaurantDetailsModal — جزئیات کامل یک رستوران (مشترک بین دو Pane)
 * ------------------------------------------------------------------- */
export async function getRestaurantProfileForAdmin(id) {
  const res = await adminRestaurantsAxios.get(`/${id}`);
  return res.data;
}

/* ---------------------------------------------------------------------
 * Shared error helper
 * ------------------------------------------------------------------- */
export function apiErrorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    (typeof err?.response?.data === "string" ? err.response.data : null) ||
    fallback
  );
}

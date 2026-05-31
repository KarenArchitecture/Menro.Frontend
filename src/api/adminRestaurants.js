// src/api/adminRestaurants.js
import adminRestaurantsAxios from "./adminRestaurantsAxios";

export function getRestaurants(status) {
  return adminRestaurantsAxios.get("", {
    params: { status },
  });
}

export function updateRestaurantStatus(restaurantId, status) {
  return adminRestaurantsAxios.post("/status", {
    restaurantId,
    status,
    rejectReason,
  });
}

export function getRestaurantDetails(id) {
  return adminRestaurantsAxios.get(`/${id}`);
}

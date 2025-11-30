import adminRestaurantsAxios from "./adminRestaurantsAxios";

export function getRestaurants(approved) {
  return adminRestaurantsAxios.get("", {
    params: { approved },
  });
}

export function approveRestaurant(restaurantId) {
  return adminRestaurantsAxios.post("/approve", {
    restaurantId,
    approve: true,
  });
}

export function rejectRestaurant(restaurantId) {
  return adminRestaurantsAxios.post("/approve", {
    restaurantId,
    approve: false,
  });
}

export function getRestaurantDetails(id) {
  return adminRestaurantsAxios.get(`/${id}`);
}

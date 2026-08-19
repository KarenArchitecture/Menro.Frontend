import userAxios from "./userAxios";

export const submitRestaurantRating = (restaurantId, score) =>
    userAxios.post("/restaurant-rating", { restaurantId, score }).then((r) => r.data);

export const getMyRestaurantRating = (restaurantId) =>
    userAxios.get(`/restaurant-rating/${restaurantId}`).then((r) => r.data);
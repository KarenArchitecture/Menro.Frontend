import restaurantRatingAxios from "./restaurantRatingAxios";

export const rateRestaurant = (restaurantId, score) =>
  restaurantRatingAxios.post("", { restaurantId, score }).then((r) => r.data);

export const getMyRestaurantRating = (restaurantId) =>
  restaurantRatingAxios.get(`/${restaurantId}`).then((r) => r.data);
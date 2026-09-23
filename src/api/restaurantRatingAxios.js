import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const restaurantRatingAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/restaurant/rating`,
  requireAuth: true,
});

export default restaurantRatingAxios;
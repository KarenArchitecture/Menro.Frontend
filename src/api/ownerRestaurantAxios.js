import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const ownerRestaurantAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/owner/restaurant`,
  requireAuth: true,
});

export default ownerRestaurantAxios;

import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const restaurantAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/public/restaurant`,
  requireAuth: false,
});

export default restaurantAxios;

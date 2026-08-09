import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const ownerRestaurantTables = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/owner/restaurant/tables`,
  requireAuth: true,
});

export default ownerRestaurantTables;

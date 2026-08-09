import { createAuthenticatedAxios } from "./createAuthenticatedAxios";
import { getOrCreateGuestCartId } from "../utils/guestCart";

const cartAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/public`,
  requireAuth: false,
  decorateConfig: (config) => {
    config.headers["X-Guest-Cart-Id"] = getOrCreateGuestCartId();
  },
});

export default cartAxios;

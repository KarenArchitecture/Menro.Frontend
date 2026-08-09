import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getOrCreateGuestCartId } from "../utils/guestCart";

const cartAxios = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/public`,
});

// Shared across concurrent cart/checkout calls so a burst of requests
// (e.g. cart.refresh() + checkoutCart() firing close together) triggers
// only ONE refresh call, not one per request.
let refreshPromise = null;

function isTokenExpired(token) {
    try {
        const { exp } = jwtDecode(token);
        if (!exp) return false;
        // 30s safety buffer so we refresh slightly before actual expiry,
        // not exactly at the edge of a race with the request itself.
        return Date.now() >= exp * 1000 - 30_000;
    } catch {
        return true; // unparsable token -> treat as expired, force a refresh
    }
}

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(
                `${import.meta.env.VITE_API_URL}/auth/refresh`,
                {},
                { withCredentials: true },
            )
            .then(({ data }) => {
                const newToken = data.accessToken || data.AccessToken;
                if (newToken) localStorage.setItem("accessToken", newToken);
                return newToken;
            })
            .catch(() => {
                // Refresh token itself is gone/invalid — nothing more we
                // can do here; fall through and let the request go out as
                // a guest request rather than throwing and breaking checkout.
                localStorage.removeItem("accessToken");
                return null;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

cartAxios.interceptors.request.use(async (config) => {
    let token = localStorage.getItem("accessToken");

    // 🔧 This endpoint is [AllowAnonymous] on the backend, so an expired
    // token does NOT come back as a 401 we could react to afterward — the
    // JWT middleware just silently treats the request as unauthenticated,
    // and the cart/order ends up attached to a GUEST instead of the logged
    // -in user. Checking + refreshing here, before the request goes out,
    // is the only way to catch that for an endpoint shaped like this one.
    if (token && isTokenExpired(token)) {
        token = await refreshAccessToken();
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["X-Guest-Cart-Id"] = getOrCreateGuestCartId();
    return config;
});

export default cartAxios;
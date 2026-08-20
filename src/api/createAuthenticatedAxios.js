// src/api/createAuthenticatedAxios.js
import axios from "axios";
import {
  getAccessToken,
  isTokenExpired,
  getValidToken,
  waitForRefresh,
  clearAccessToken,
} from "./tokenManager";
import { globalLogout } from "../context/AuthContext";

/**
 * Creates an axios instance wired into the shared token refresh flow.
 *
 * @param {object} options
 * @param {string} options.baseURL
 * @param {boolean} [options.requireAuth=true] - if false (e.g. an
 *   [AllowAnonymous] endpoint like cart), a failed/expired token does NOT
 *   trigger logout — the request just goes out unauthenticated instead.
 * @param {(config) => void} [options.decorateConfig] - hook to add extra
 *   headers per-request (e.g. cartAxios's X-Guest-Cart-Id).
 */
export function createAuthenticatedAxios({
  baseURL,
  requireAuth = true,
  decorateConfig,
} = {}) {
  const instance = axios.create({ baseURL, withCredentials: true });

  // ---- PROACTIVE: check/refresh BEFORE the request goes out ----
  // Catches the case where the token is expired but the endpoint wouldn't
  // give us a 401 to react to (AllowAnonymous endpoints), and also just
  // avoids a wasted round trip for endpoints that would 401.
  instance.interceptors.request.use(async (config) => {
    let token = getAccessToken();

    if (token && isTokenExpired(token)) {
      token = await getValidToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    decorateConfig?.(config);

    return config;
  });

  // ---- REACTIVE: fallback if a 401 slips through anyway ----
  // (clock skew between client/server, token revoked server-side, etc.)
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const shouldTryRefresh =
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/refresh") &&
        !originalRequest.url.includes("/login");

      if (!shouldTryRefresh) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const newToken = await waitForRefresh();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      }

      // Refresh failed / no session.
      if (requireAuth) {
        clearAccessToken();
        await globalLogout(false);
        window.location.href = "/";
      }
      // else: requireAuth === false -> let it fail silently as guest,
      // caller's .catch (if any) handles it.

      return Promise.reject(error);
    },
  );

  return instance;
}

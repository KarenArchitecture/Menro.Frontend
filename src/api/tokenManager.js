// src/api/tokenManager.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const REFRESH_URL = `${import.meta.env.VITE_API_URL}/auth/refresh`;
const EXPIRY_BUFFER_MS = 30_000; // 30s buffer before actual expiry

// Single-flight: shared across EVERY axios instance in the app so a burst
// of requests (me, profile, cart, blogs...) all firing near-simultaneously
// triggers only ONE refresh call, not one per instance/request.
let refreshPromise = null;

// Listeners waiting on the in-flight refresh (used by the reactive/401 path
// so concurrent requests that already went out and got 401 can all resolve
// once the single refresh completes, instead of each retrying separately).
let waiters = [];

function notifyWaiters(token) {
  waiters.forEach((cb) => cb(token));
  waiters = [];
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token) {
  if (token) localStorage.setItem("accessToken", token);
}

export function clearAccessToken() {
  localStorage.removeItem("accessToken");
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return false;
    return Date.now() >= exp * 1000 - EXPIRY_BUFFER_MS;
  } catch {
    return true; // unparsable -> treat as expired, force a refresh
  }
}

/**
 * Performs (or joins) the single in-flight refresh call.
 * Always safe to call from multiple places at once.
 */
export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = axios
    .post(REFRESH_URL, {}, { withCredentials: true })
    .then(({ data }) => {
      const newToken = data.accessToken || data.AccessToken;
      if (newToken) setAccessToken(newToken);
      notifyWaiters(newToken || null);
      return newToken || null;
    })
    .catch((err) => {
      // Refresh token itself is gone/invalid — caller decides what to do
      // (e.g. authAxios logs the user out; cartAxios just falls back to guest).
      clearAccessToken();
      notifyWaiters(null);
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Proactive helper: call this in a request interceptor BEFORE sending a
 * request. If the current token is missing/expired it refreshes (or joins
 * an in-flight refresh) and returns the fresh token. Never throws — resolves
 * to null if there's no valid session, so callers can decide (guest vs redirect).
 */
export async function getValidToken() {
  const token = getAccessToken();
  if (!token) return null;
  if (!isTokenExpired(token)) return token;

  try {
    return await refreshAccessToken();
  } catch {
    return null;
  }
}

/**
 * Reactive helper: call this from a response interceptor's 401 handler.
 * Joins the shared single-flight refresh instead of starting a new one.
 */
export function waitForRefresh() {
  return new Promise((resolve) => {
    // If nothing is in flight yet, kick one off; otherwise just subscribe.
    if (!refreshPromise) {
      refreshAccessToken()
        .then(resolve)
        .catch(() => resolve(null));
    } else {
      waiters.push(resolve);
    }
  });
}

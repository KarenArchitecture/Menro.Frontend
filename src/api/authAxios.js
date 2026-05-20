import axios from "axios";
import { globalLogout } from "../Context/AuthContext";

const authAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
  withCredentials: true,
});

// Request interceptor
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (refresh flow)
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh") &&
      !originalRequest.url.includes("/login")
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await authAxios.post(
          "/refresh",
          {},
          { withCredentials: true }
        );

        const newAccessToken =
          data.accessToken || data.AccessToken;

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);

          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

          return authAxios(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Refresh token failed:", refreshError);

        await globalLogout(false);

        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default authAxios;
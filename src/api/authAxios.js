import axios from "axios";
import { globalLogout } from "../context/AuthContext";

const authAxios = axios.create({
  //baseURL: "https://localhost:5096/api/auth",
  baseURL: "https://localhost:7270/api/auth",
  withCredentials: true,
});

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

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
        const newAccessToken = data.accessToken || data.AccessToken;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return authAxios(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Refresh token failed:", refreshError);
        await globalLogout(false);
        navigate("/", { replace: true });
      }
    }

    return Promise.reject(error);
  }
);

export default authAxios;

// src/api/authAxios.js
// import axios from "axios";

// const base = import.meta.env.VITE_API_BASE_URL?.replace("/public", "") || "https://localhost:7270/api";

// const authAxios = axios.create({
//   baseURL: "https://localhost:7270/api/auth",
//   withCredentials: true,
// });

// export default authAxios;
// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import authAxios from "../api/authAxios";
import userAxios from "../api/userAxios";

export let globalLogout = () => {};
export function setGlobalLogout(fn) {
  globalLogout = fn;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  /* ------------------------
   * INITIAL LOAD
   * ---------------------- */
  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const roles =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const normalizedRoles = Array.isArray(roles)
        ? roles
        : roles
        ? [roles]
        : [];

      if (!cancelled) {
        setUser({
          id: decoded.nameid || decoded.sub,
          email: decoded.email,
          roles: normalizedRoles.map((r) => r.toLowerCase()),
          fullName: decoded.fullName || decoded.name || "",
        });
      }
    } catch (err) {
      console.error("❌ Invalid token:", err);
      localStorage.removeItem("accessToken");
    }

    // فقط یک بار فراخوانی /me
    authAxios
      .get("/me")
      .then((res) => {
        if (cancelled) return;
        setUser({
          id: res.data.id,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
          roles: res.data.roles.map((r) => r.toLowerCase()),
          fullName: res.data.fullName,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("⚠️ Failed to fetch /auth/me:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
        }
        setUser(null);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  // get avatar url
  useEffect(() => {
    if (!token) {
      setAvatarUrl(null);
      return;
    }

    const loadUserProfile = async () => {
      try {
        const { data } = await userAxios.get("/profile");
        setAvatarUrl(data.profileImageUrl);
      } catch (err) {
        console.error("خطا در لود پروفایل:", err);
      }
    };

    loadUserProfile();
  }, [token]);

  /* ------------------------
   * REFRESH USER
   * ---------------------- */
  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setToken(null);
      return;
    }
    setToken(token);

    try {
      const res = await authAxios.get("/me");
      setUser({
        id: res.data.id,
        email: res.data.email,
        phoneNumber: res.data.phoneNumber,
        roles: res.data.roles.map((r) => r.toLowerCase()),
        fullName: res.data.fullName,
      });
    } catch (err) {
      console.warn("❌ refreshUser failed:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
      }
      setUser(null);
    }
  };

  /* ------------------------
   * REGISTER
   * ---------------------- */
  const registerUser = async (payload) => {
    try {
      const { data } = await authAxios.post("/register", payload);

      // پاسخ معمولاً شامل accessToken است
      const accessToken = data.token || data.accessToken;

      // 1) ذخیره توکن
      localStorage.setItem("accessToken", accessToken);
      setToken(accessToken);

      // 2) پاک کردن شماره موقت (اگر استفاده شده مثل OTP)
      localStorage.removeItem("userPhone");

      // 3) لود اطلاعات کاربر
      await refreshUser();

      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.";
      throw new Error(message);
    }
  };

  /* ------------------------
   * LOGIN
   * ---------------------- */
  const loginWithUserId = async (userId) => {
    try {
      const { data } = await authAxios.post("/login", { userId });
      const { accessToken } = data;

      // 1) ذخیره توکن
      localStorage.setItem("accessToken", accessToken);
      setToken(accessToken); // ✅ این باعث میشه avatar دوباره لود بشه

      // 2) لود اطلاعات کاربر
      await refreshUser();

      return true;
    } catch (err) {
      console.error("❌ loginWithUserId failed:", err);
      throw err;
    }
  };

  /* ------------------------
    LOGOUT
   ---------------------- */
  const logout = async (redirect = true) => {
    try {
      await authAxios.post("/logout", {}, { withCredentials: true });
    } catch (err) {
      console.warn("⚠️ logout request failed:", err);
    }

    localStorage.removeItem("userPhone");
    localStorage.removeItem("accessToken");
    setToken(null);
    setAvatarUrl(null); // 🛑 عکس قبلی را هم پاک کن
    setUser(null);
    localStorage.setItem("logout-event", Date.now().toString());
    await refreshUser();

    if (redirect) window.location.href = "/"; // به صفحه اصلی برگرد
  };
  // ثبت logout جهانی برای interceptor
  useEffect(() => {
    setGlobalLogout(logout);
  }, []);
  // sync logout بین تب‌ها
  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === "logout-event") setUser(null);
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  /* ------------------------
   * RETURN
   * ---------------------- */
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
        refreshUser,
        avatarUrl,
        setToken,
        loginWithUserId,
        registerUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

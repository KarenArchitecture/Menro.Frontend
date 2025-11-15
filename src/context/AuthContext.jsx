// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import authAxios from "../api/authAxios";

export let globalLogout = () => {};
export function setGlobalLogout(fn) {
  globalLogout = fn;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------
    LOGOUT
   ---------------------- */
  const logout = async (redirect = true) => {
    try {
      await authAxios.post("/logout", {}, { withCredentials: true });
    } catch (err) {
      console.warn("⚠️ logout request failed:", err);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userPhone");
    setUser(null);
    localStorage.setItem("logout-event", Date.now().toString());

    if (redirect) window.location.href = "/"; // به صفحه اصلی برگرد
  };

  // sync logout بین تب‌ها
  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === "logout-event") setUser(null);
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  // ثبت logout جهانی برای interceptor
  useEffect(() => {
    setGlobalLogout(logout);
  }, []);

  /* ------------------------
   * REFRESH USER
   * ---------------------- */
  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      return;
    }

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

  /* ------------------------
   * RETURN
   * ---------------------- */
  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, loading, refreshUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

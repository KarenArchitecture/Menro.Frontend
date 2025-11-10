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

  const logout = async () => {
    try {
      await authAxios.post("/logout", {}, { withCredentials: true });
    } catch (err) {
      console.warn("⚠️ logout request failed:", err);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userPhone");
    setUser(null);
    localStorage.setItem("logout-event", Date.now().toString());
    if (redirect) navigate("/", { replace: true });
  };

  // 🔹 sync logout بین تب‌ها
  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === "logout-event") setUser(null);
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  // 🔹 ثبت logout جهانی برای استفاده در interceptor
  useEffect(() => {
    setGlobalLogout(logout);
    refreshUser();
  }, [logout]);

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
      console.error("❌ refreshUser failed:", err);
      setUser(null);
      localStorage.removeItem("accessToken");
    }
  };

  // 🔹 decode token و load اولیه
  useEffect(() => {
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

      setUser({
        id: decoded.nameid || decoded.sub,
        email: decoded.email,
        roles: normalizedRoles.map((r) => r.toLowerCase()),
        fullName: decoded.fullName || decoded.name || "",
      });
    } catch (err) {
      console.error("❌ Invalid token:", err);
      localStorage.removeItem("accessToken");
    }

    authAxios
      .get("/me")
      .then((res) => {
        setUser({
          id: res.data.id,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
          roles: res.data.roles.map((r) => r.toLowerCase()),
          fullName: res.data.fullName,
        });
      })
      .catch((err) => {
        console.warn("⚠️ Failed to fetch /auth/me:", err);
        setUser(null);
        localStorage.removeItem("accessToken");
      })
      .finally(() => setLoading(false));
  }, []);

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

import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import authAxios from "../api/authAxios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); //
    localStorage.removeItem("userPhone"); //
    setUser(null);
  };
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    // 🔹 مرحله اول: decode فوری برای سرعت
    const token = localStorage.getItem("token");
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
      });
    } catch (err) {
      console.error("❌ Invalid token:", err);
      localStorage.removeItem("token");
    }

    // 🔹 مرحله دوم: درخواست /auth/me برای دقت و به‌روزرسانی
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
        localStorage.removeItem("token");
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

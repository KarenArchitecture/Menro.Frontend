import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

export default function ProtectedRoute({ roles = [], children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // مسیر + کوئری‌استرینگ فعلی، برای بازگشت بعد از لاگین
  const returnUrl = encodeURIComponent(location.pathname + location.search);

  if (!user) {
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace={false} />;
  }

  const hasAccess =
    roles.length === 0 ||
    roles.some((r) => user.roles?.includes(r.toLowerCase()));

  if (!hasAccess) {
    // returnUrl رو به صفحه‌ی unauthorized هم پاس می‌دیم تا اگر کاربر با
    // حساب درست دوباره لاگین کرد، به همون صفحه‌ی اصلی برگرده نه لندینگ
    return <Navigate to={`/unauthorized?returnUrl=${returnUrl}`} replace />;
  }

  return children;
}

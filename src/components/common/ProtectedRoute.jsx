import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ roles = [], children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace={false} />;
  }

  const hasAccess =
    roles.length === 0 ||
    roles.some((r) => user.roles?.includes(r.toLowerCase()));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

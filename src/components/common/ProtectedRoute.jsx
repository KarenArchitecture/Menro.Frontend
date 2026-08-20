// src/components/common/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { RestaurantStatus } from "../../constants/restaurantStatus";

export default function ProtectedRoute({
  roles = [],
  checkPendingOwner = false,
  blockIfHasRestaurant = false,
  children,
}) {
  const {
    user,
    loading,
    restaurantStatus,
    restaurantStatusLoading,
    fetchRestaurantStatus,
  } = useAuth();
  const location = useLocation();

  const needsStatusCheck = checkPendingOwner || blockIfHasRestaurant;

  // اگه هیچ‌کدوم لازم نیست، از همون اول "انجام‌شده" حساب می‌شه
  const [pendingCheckDone, setPendingCheckDone] = useState(!needsStatusCheck);

  const returnUrl = encodeURIComponent(location.pathname + location.search);

  const hasAccess =
    roles.length === 0 ||
    roles.some((r) => user?.roles?.includes(r.toLowerCase()));

  useEffect(() => {
    if (!loading && user && needsStatusCheck) {
      fetchRestaurantStatus().finally(() => setPendingCheckDone(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, needsStatusCheck]);

  if (loading) return null;

  if (!user) {
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace={false} />;
  }

  // مسیر ثبت رستوران: صرف‌نظر از role، اگه کاربر از قبل یه رستوران
  // (با هر وضعیتی) داره، اجازه نداره دوباره فرم ثبت رو ببینه
  if (blockIfHasRestaurant) {
    if (!pendingCheckDone || restaurantStatusLoading) return null;

    if (restaurantStatus) {
      return <Navigate to="/restaurant-status" replace />;
    }
  }

  if (!hasAccess) {
    if (checkPendingOwner) {
      // تا وقتی اولین فچ (موفق یا ناموفق) تمام نشده، صبر می‌کنیم
      if (!pendingCheckDone || restaurantStatusLoading) return null;

      if (
        restaurantStatus?.status === RestaurantStatus.Pending ||
        restaurantStatus?.status === RestaurantStatus.Rejected
      ) {
        return <Navigate to="/restaurant-status" replace />;
      }
    }

    return <Navigate to={`/unauthorized?returnUrl=${returnUrl}`} replace />;
  }

  return children;
}

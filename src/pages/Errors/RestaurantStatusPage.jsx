// src/pages/errors/RestaurantStatusPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalUI } from "../../components/common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useAuth } from "../../context/AuthContext";
import { RestaurantStatus } from "../../constants/restaurantStatus";

import "../../assets/css/auth.css";

const STATUS_META = {
  [RestaurantStatus.Pending]: {
    emoji: "⏳",
    badgeClass: "rst-badge-pending",
    badgeLabel: "در حال بررسی",
    heading: "درخواست شما در حال بررسی است",
    subtitle:
      "درخواست ثبت رستوران شما برای ادمین ارسال شده و به‌زودی بررسی خواهد شد. نتیجه از همین طریق به شما اطلاع داده می‌شود.",
  },
  [RestaurantStatus.Approved]: {
    emoji: "✅",
    badgeClass: "rst-badge-approved",
    badgeLabel: "تایید شده",
    heading: "درخواست شما تایید شد",
    subtitle: "رستوران شما تایید شده است. حالا می‌توانید وارد پنل مدیریت شوید.",
  },
  [RestaurantStatus.Rejected]: {
    emoji: "❌",
    badgeClass: "rst-badge-rejected",
    badgeLabel: "رد شده",
    heading: "درخواست شما رد شد",
    subtitle:
      "متأسفانه درخواست ثبت رستوران شما تایید نشد. می‌توانید با توجه به دلیل زیر، درخواست جدیدی ثبت کنید.",
  },
};

export default function RestaurantStatusPage() {
  useDocumentTitle("وضعیت ثبت رستوران");
  const {
    restaurantStatus,
    restaurantStatusLoading,
    fetchRestaurantStatus,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const { confirmModal } = useGlobalUI();
  const [notFound, setNotFound] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleGoToAdmin = () => {
    logout(`/login?returnUrl=${encodeURIComponent("/admin")}`);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchRestaurantStatus();
      if (!cancelled) setNotFound(!data);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const data = await fetchRestaurantStatus();
    setNotFound(!data);
    setRefreshing(false);
  };
  const handleLogout = async () => {
    const ok = await confirmModal({
      title: "خروج از حساب",
      message: "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟",
      confirmText: "خروج",
      cancelText: "انصراف",
      danger: true,
    });
    if (!ok) return;

    logout("/home");
  };

  // اولین لود، هنوز جوابی از /my-status نیومده
  if (restaurantStatusLoading && !restaurantStatus) {
    return (
      <div className="auth-screen" dir="rtl">
        <div className="auth-screen__inner">
          <div className="auth-hero auth-error-hero">
            <span
              className="auth-error-emoji"
              role="img"
              aria-label="در حال بارگذاری"
            >
              ⏳
            </span>
          </div>
          <div className="auth-copy">
            <h1 className="auth-heading">در حال بررسی وضعیت...</h1>
          </div>
        </div>
      </div>
    );
  }

  // کاربر هیچ درخواست ثبت رستورانی نداده (404 از بک‌اند)
  if (notFound || !restaurantStatus) {
    return (
      <div className="auth-screen" dir="rtl">
        <div className="auth-screen__inner">
          <div className="auth-hero auth-error-hero">
            <span className="auth-error-emoji" role="img" aria-label="یافت نشد">
              🏬
            </span>
          </div>
          <div className="auth-copy">
            <h1 className="auth-heading">
              هیچ <span className="accent">درخواستی</span> ثبت نشده
            </h1>
            <p className="auth-subtitle">
              شما تاکنون درخواستی برای ثبت رستوران ارسال نکرده‌اید.
            </p>
          </div>
          <div className="auth-btn-row auth-error-actions">
            <Link to="/" className="auth-btn auth-btn-secondary">
              صفحه اصلی
            </Link>
            <Link
              to="/restaurant-register"
              className="auth-btn auth-btn-primary"
            >
              ثبت رستوران
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const meta =
    STATUS_META[restaurantStatus.status] ||
    STATUS_META[RestaurantStatus.Pending];

  return (
    <div className="auth-screen" dir="rtl">
      <div className="auth-screen__inner">
        <div className="auth-hero auth-error-hero">
          <span
            className="auth-error-emoji"
            role="img"
            aria-label={meta.badgeLabel}
          >
            {meta.emoji}
          </span>
        </div>

        <div className="auth-copy">
          <h1 className="auth-heading">{meta.heading}</h1>
          <p className="auth-subtitle">{meta.subtitle}</p>
        </div>

        <div className="rst-info-card">
          <div className="rst-info-row">
            <span className="rst-info-label">نام رستوران</span>
            <span className="rst-info-value">
              {restaurantStatus.restaurantName}
            </span>
          </div>
          <div className="rst-info-row">
            <span className="rst-info-label">وضعیت</span>
            <span className={`rst-badge ${meta.badgeClass}`}>
              {meta.badgeLabel}
            </span>
          </div>
        </div>

        {restaurantStatus.status === RestaurantStatus.Rejected &&
          restaurantStatus.rejectReason && (
            <div className="rst-reason-box">
              <span className="rst-reason-label">دلیل رد درخواست</span>
              {restaurantStatus.rejectReason}
            </div>
          )}

        <div className="auth-btn-row auth-error-actions">
          <Link to="/" className="auth-btn auth-btn-secondary">
            صفحه اصلی
          </Link>

          {restaurantStatus.status === RestaurantStatus.Approved && (
            <button
              type="button"
              className="auth-btn auth-btn-primary"
              onClick={handleGoToAdmin}
            >
              ورود به پنل مدیریت
            </button>
          )}

          {restaurantStatus.status === RestaurantStatus.Rejected && (
            <Link
              to="/register-restaurant"
              className="auth-btn auth-btn-primary"
            >
              ثبت درخواست جدید
            </Link>
          )}

          {restaurantStatus.status === RestaurantStatus.Pending && (
            <button
              type="button"
              className="auth-btn auth-btn-primary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? "در حال بررسی..." : "بررسی مجدد وضعیت"}
            </button>
          )}
        </div>

        <button
          type="button"
          className="auth-chip-btn"
          style={{ marginTop: 16 }}
          onClick={() => handleLogout()}
        >
          خروج از حساب
        </button>
      </div>
    </div>
  );
}

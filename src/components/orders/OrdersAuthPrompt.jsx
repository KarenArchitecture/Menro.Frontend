// src/components/orders/OrdersAuthPrompt.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function OrdersAuthPrompt({ compact = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      dir="rtl"
      className={`orders-auth-prompt ${compact ? "orders-auth-prompt--compact" : ""}`}
    >
      <div className="orders-auth-prompt__icon-wrap">
        <div className="orders-auth-prompt__icon-glow" />
        <div className="orders-auth-prompt__icon-circle">
          <ShoppingBag className="orders-auth-prompt__icon" />
        </div>
      </div>

      <h3 className="orders-auth-prompt__title">تاریخچه سفارش‌ها</h3>
      <p className="orders-auth-prompt__text">
        برای مشاهده سفارش‌های قبلی خود باید وارد حساب کاربری شوید.
      </p>

      <button
        type="button"
        className="cs-btn cs-btn-continue orders-auth-prompt__btn"
        onClick={() =>
          navigate(
            `/login?returnUrl=${encodeURIComponent(location.pathname)}`,
          )
        }
      >
        ورود به حساب کاربری
      </button>
    </div>
  );
}
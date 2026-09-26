// src/components/orders/OrdersAuthPrompt.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function LoginRequiredIcon({ className }) {
  return (
    <svg
      className={className}
      width="24"
      height="22"
      viewBox="0 0 24 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.55277 0.920631C2.50689 1.84126 2.2314 3.39959 1.68042 6.51626L0.738944 11.8419C-0.0358231 16.2245 -0.423207 18.4158 0.706215 19.8591C1.83564 21.3025 3.93768 21.3025 8.14178 21.3025H15.0973C19.3014 21.3025 21.4034 21.3025 22.5329 19.8591C23.6623 18.4158 23.2749 16.2245 22.5001 11.8419L21.5587 6.51626C21.0077 3.39959 20.7322 1.84126 19.6863 0.920631C18.6404 0 17.1456 0 14.1558 0H9.08327C6.09353 0 4.59866 0 3.55277 0.920631ZM8.95607 4.99286C9.34426 6.15771 10.3917 6.98988 11.62 6.98988C12.8483 6.98988 13.8958 6.15771 14.284 4.99286C14.4573 4.4729 14.9952 4.20037 15.4854 4.38415C15.9757 4.56793 16.2326 5.13842 16.0593 5.65839C15.4136 7.59622 13.6711 8.98699 11.62 8.98699C9.56894 8.98699 7.82652 7.59622 7.18074 5.65839C7.00746 5.13842 7.26442 4.56793 7.75466 4.38415C8.2449 4.20037 8.78279 4.4729 8.95607 4.99286Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
          <LoginRequiredIcon className="orders-auth-prompt__icon" />
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
// src/pages/UnauthorizedPage.jsx
import { Link, useLocation } from "react-router-dom";
import "../../assets/css/auth.css";

export default function UnauthorizedPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const returnUrl = params.get("returnUrl");
  const loginHref = returnUrl ? `/login?returnUrl=${returnUrl}` : "/login";

  return (
    <div className="auth-screen" dir="rtl">
      <div className="auth-screen__inner">
        <div className="auth-hero auth-error-hero">
          <span className="auth-error-emoji" role="img" aria-label="ممنوع">
            🚫
          </span>
        </div>

        <div className="auth-copy">
          <h1 className="auth-heading">
            دسترسی <span className="accent">غیرمجاز</span>
          </h1>
          <p className="auth-subtitle">
            شما اجازه‌ی ورود به این صفحه را ندارید. برای ادامه، وارد حساب کاربری
            خود شوید یا به صفحه‌ی اصلی بازگردید.
          </p>
        </div>

        <div className="auth-btn-row auth-error-actions">
          <Link to="/" className="auth-btn auth-btn-secondary">
            صفحه اصلی
          </Link>
          <Link to={loginHref} className="auth-btn auth-btn-primary">
            صفحه ورود
          </Link>
        </div>
      </div>
    </div>
  );
}

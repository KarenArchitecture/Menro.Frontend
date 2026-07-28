// src/pages/NotFoundPage.jsx
import { Link } from "react-router-dom";
import "../assets/css/auth.css";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("404 - صفحه پیدا نشد");
  return (
    <div className="auth-screen" dir="rtl">
      <div className="auth-screen__inner">
        <div className="auth-hero auth-error-hero">
          <span className="auth-error-code">۴۰۴</span>
        </div>

        <div className="auth-copy">
          <h1 className="auth-heading">
            صفحه‌ی <span className="accent">مورد نظر</span> پیدا نشد
          </h1>
          <p className="auth-subtitle">
            آدرسی که وارد کرده‌اید وجود ندارد یا جابه‌جا شده است. می‌توانید به
            صفحه‌ی اصلی برگردید یا به مسیر قبلی بازگردید.
          </p>
        </div>

        <div className="auth-btn-row auth-error-actions">
          <Link to="/" className="auth-btn auth-btn-primary">
            صفحه اصلی
          </Link>
          <button
            type="button"
            className="auth-btn auth-btn-secondary"
            onClick={() => window.history.back()}
          >
            بازگشت به صفحه قبل
          </button>
        </div>
      </div>
    </div>
  );
}

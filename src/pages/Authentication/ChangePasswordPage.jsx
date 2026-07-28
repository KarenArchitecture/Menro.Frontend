import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import authAxios from "../../api/authAxios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../assets/css/auth.css";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function ChangePasswordPage() {
  useDocumentTitle("تغییر رمز عبور");
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = new URLSearchParams(location.search).get("returnUrl");

  const [current, setCurrent] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  /* --- Submit Change Password --- */
  const changePassword = useMutation({
    mutationFn: async () => {
      const payload = {
        currentPassword: current,
        newPassword: pass,
        confirmNewPassword: confirm,
      };
      await authAxios.post("/change-password", payload);
    },
    onSuccess: () => {
      setMsg("رمز عبور با موفقیت تغییر کرد ✔");
      setTimeout(() => {
        navigate(returnUrl?.startsWith("/") ? returnUrl : "/profile/edit");
      }, 1000);
    },
    onError: (err) => {
      setMsg(err.response?.data?.message || "خطا در تغییر رمز عبور.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (pass.length < 6) {
      setMsg("رمز جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }
    if (pass !== confirm) {
      setMsg("رمز جدید و تکرار آن یکسان نیست.");
      return;
    }

    setMsg("");
    changePassword.mutate();
  };

  return (
    <div className="auth-screen" dir="rtl">
      <Link
        to="/home"
        className="auth-home-btn"
        aria-label="بازگشت به صفحه اصلی"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
        </svg>
      </Link>
      {/* Reusable "back" button — copy this block (and .auth-back-btn in
          auth.css) into any other auth page that needs it. */}
      <button
        type="button"
        className="auth-back-btn"
        aria-label="بازگشت"
        onClick={() => navigate(returnUrl?.startsWith("/") ? returnUrl : -1)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      <div className="auth-screen__inner">
        <div className="auth-hero">
          <img src="/images/cake-auth.png" alt="" className="auth-hero-img" />
        </div>

        <div className="auth-copy">
          <h1 className="auth-heading">
            تغییر <span className="accent">رمز</span> عبور
          </h1>
          <p className="auth-subtitle">
            برای امنیت بیشتر حساب خود، رمز عبور جدید تعیین کنید.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">رمز عبور فعلی</label>
            <input
              type="password"
              className="auth-input"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">رمز جدید</label>
            <input
              type="password"
              className="auth-input"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">تکرار رمز جدید</label>
            <input
              type="password"
              className="auth-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            className="auth-btn auth-btn-primary"
            type="submit"
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? "در حال ثبت..." : "تغییر رمز عبور"}
          </button>

          {msg && (
            <p
              className={`auth-message ${
                changePassword.isSuccess ? "success" : ""
              }`}
            >
              {msg}
            </p>
          )}

          <div className="auth-footer">
            <Link to="/forgot-password" className="auth-chip-btn">
              فراموشی رمز عبور
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

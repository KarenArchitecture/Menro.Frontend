import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import authAxios from "../api/authAxios";
import usePageStyles from "../hooks/usePageStyles";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
  usePageStyles("/forgot-password.css"); // همان استایل صفحه قبلی، سازگار هست

  const navigate = useNavigate();

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
      setTimeout(() => navigate("/admin"), 1000);
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
    <section className="auth-wrap" dir="rtl">
      <div className="auth-card">
        <h1 className="auth-title">تغییر رمز عبور</h1>

        <form className="auth-body" onSubmit={handleSubmit}>
          {/* Current Password */}
          <label className="auth-label">رمز عبور فعلی</label>
          <input
            type="password"
            className="auth-input"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />

          {/* New Password */}
          <label className="auth-label">رمز جدید</label>
          <input
            type="password"
            className="auth-input"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            minLength={6}
          />

          {/* Confirm New Password */}
          <label className="auth-label">تکرار رمز جدید</label>
          <input
            type="password"
            className="auth-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
          />

          <button
            className="btn btn-primary mt-16"
            type="submit"
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? "در حال ثبت..." : "تغییر رمز عبور"}
          </button>

          {msg && <p className="form-message">{msg}</p>}
        </form>
      </div>
    </section>
  );
}

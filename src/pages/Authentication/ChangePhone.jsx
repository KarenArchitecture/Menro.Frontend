import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import authAxios from "../../api/authAxios";
import { useNavigate, useLocation, Link } from "react-router-dom";

import "../../assets/css/auth.css";

function OTP({ length = 5, onValue }) {
  const refs = useRef([]);
  const [boxes, setBoxes] = useState(Array(length).fill(""));

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const update = (i, v) => {
    const next = [...boxes];
    next[i] = v.replace(/\D/g, "").slice(0, 1);
    setBoxes(next);
    onValue(next.join(""));
    if (next[i] && refs.current[i + 1]) refs.current[i + 1].focus();
  };

  const handleReset = () => {
    setBoxes(Array(length).fill(""));
    onValue("");
    refs.current[0]?.focus();
  };

  return (
    <div className="otp-group">
      <div className="otp-row">
        {boxes.map((val, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            className="otp-box"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !boxes[i] && refs.current[i - 1]) {
                refs.current[i - 1].focus();
              }
            }}
          />
        ))}
      </div>
      <button
        type="button"
        className="otp-refresh-btn"
        onClick={handleReset}
        aria-label="پاک کردن کد و شروع مجدد"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <polyline points="21 3 21 9 15 9" />
        </svg>
      </button>
    </div>
  );
}

function StepProgress({ step, total = 2 }) {
  return (
    <div className="auth-progress">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`auth-progress__step ${i + 1 === step ? "is-active" : i + 1 < step ? "is-done" : ""}`}
        />
      ))}
    </div>
  );
}

export default function ChangePhone() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = new URLSearchParams(location.search).get("returnUrl");

  const [newPhone, setNewPhone] = useState("");
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  /* 1) send OTP */
  const sendOtp = useMutation({
    mutationFn: async (phoneNumber) => {
      const { data } = await authAxios.post("/send-otp", { phoneNumber });
      return data;
    },
    onSuccess: () => {
      setMsg("");
      setStep(2);
    },
    onError: (err) => {
      setMsg(
        err.response?.data?.message ||
          "خطا در ارسال کد، لطفاً دوباره تلاش کنید.",
      );
    },
  });

  /* 2) verify + commit در یک درخواست */
  const changePhone = useMutation({
    mutationFn: async ({ newPhone, code }) => {
      const { data } = await authAxios.put("/change-phone", { newPhone, code });
      return data;
    },
    onSuccess: () => {
      setMsg("شماره با موفقیت تغییر کرد ✔");
      setTimeout(() => {
        navigate(returnUrl?.startsWith("/") ? returnUrl : "/profile/edit");
      }, 800);
    },
    onError: (err) => {
      setMsg(err.response?.data?.message || "تغییر شماره ناموفق بود.");
    },
  });

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

        <StepProgress step={step} total={2} />

        {step === 1 && (
          <>
            <div className="auth-copy">
              <h1 className="auth-heading">
                تغییر <span className="accent">شماره</span> همراه
              </h1>
              <p className="auth-subtitle">
                شماره همراه جدید خود را وارد کنید تا کد تأیید برایتان ارسال شود.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^\d{11}$/.test(newPhone)) {
                  setMsg("شماره تلفن باید ۱۱ رقم باشد.");
                  return;
                }
                setMsg("");
                sendOtp.mutate(newPhone);
              }}
            >
              <div className="auth-field">
                <label className="auth-label">شماره همراه جدید</label>
                <input
                  className="auth-input"
                  inputMode="tel"
                  placeholder="09xxxxxxxxx"
                  value={newPhone}
                  onChange={(e) =>
                    setNewPhone(e.target.value.replace(/[^\d]/g, ""))
                  }
                  required
                />
              </div>

              <button
                className="auth-btn auth-btn-primary"
                type="submit"
                disabled={sendOtp.isPending}
              >
                {sendOtp.isPending ? "در حال ارسال..." : "ارسال کد"}
              </button>

              {msg && <p className="auth-message">{msg}</p>}
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-copy">
              <h1 className="auth-heading">
                کد <span className="accent">تأیید</span> را وارد کنید
              </h1>
              <p className="auth-subtitle">
                کد ارسال‌شده به شماره {newPhone} را وارد کنید.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.length !== 5) {
                  setMsg("کد باید ۵ رقم باشد.");
                  return;
                }
                setMsg("");
                changePhone.mutate({ newPhone, code });
              }}
            >
              <OTP length={5} onValue={setCode} />

              <button
                className="auth-btn auth-btn-primary mt-16"
                type="submit"
                disabled={changePhone.isPending || code.length !== 5}
              >
                {changePhone.isPending
                  ? "در حال بررسی..."
                  : "تأیید و تغییر شماره"}
              </button>

              {msg && (
                <p
                  className={`auth-message ${changePhone.isSuccess ? "success" : ""}`}
                >
                  {msg}
                </p>
              )}

              <div className="auth-footer">
                <button
                  type="button"
                  className="auth-chip-btn"
                  onClick={() => sendOtp.mutate(newPhone)}
                  disabled={sendOtp.isPending}
                >
                  ارسال مجدد کد
                </button>
                <button
                  type="button"
                  className="auth-chip-btn"
                  onClick={() => {
                    setCode("");
                    setMsg("");
                    setStep(1);
                  }}
                >
                  ویرایش شماره همراه
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

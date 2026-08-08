import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import authAxios from "../../api/authAxios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../assets/css/auth.css";
import useDocumentTitle from "../../hooks/useDocumentTitle";
/* ────────────────────────────────
function OTP({ length = 5, onValue }) {
──────────────────────────────── */

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

function StepProgress({ step, total = 3 }) {
  return (
    <div className="auth-progress">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`auth-progress__step ${
            i + 1 === step ? "is-active" : i + 1 < step ? "is-done" : ""
          }`}
        />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  useDocumentTitle("فراموشی رمز عبور");
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = new URLSearchParams(location.search).get("returnUrl");

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  // Proof that THIS phone number just passed OTP verification. The backend
  // mints this (short-lived, phone-bound) only inside a successful /verify
  // call and re-checks it against the phone number on /reset-password.
  // Without it, reset-password now rejects the request outright — this is
  // what actually stops someone from resetting an arbitrary phone number's
  // password; entering a phone number and "some code" is no longer enough
  // on its own.
  const [resetToken, setResetToken] = useState("");

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
      // Rate-limit responses ("too soon since the last code") land here
      // too — the backend is the single source of truth for cooldowns,
      // so we just surface whatever message it sends back.
      const msg =
        err.response?.data?.message ||
        "خطا در ارسال کد، لطفاً دوباره تلاش کنید.";
      setMsg(msg);
    },
  });

  /* 2) verify OTP (forgot-password) */
  const verifyOtp = useMutation({
    mutationFn: async ({ phoneNumber, code }) => {
      const { data } = await authAxios.post("/forgot-password/verify", {
        phoneNumber,
        code,
      });
      return data;
    },
    onSuccess: (data) => {
      // اگه شماره حساب نداشته باشه، بک‌اند خودش 400 برمی‌گردونه و این
      // onSuccess اصلاً اجرا نمی‌شه — دیگه نیازی به چک needsRegister نیست.
      setResetToken(data.resetToken || "");
      setMsg("");
      setStep(3);
    },
    onError: (err) =>
      setMsg(err.response?.data?.message || "کد وارد شده صحیح نیست."),
  });

  /* 3) reset password */
  const resetPassword = useMutation({
    mutationFn: async ({
      phoneNumber,
      newPassword,
      newPasswordConfirm,
      resetToken,
    }) => {
      await authAxios.post("/reset-password", {
        phoneNumber,
        newPassword,
        newPasswordConfirm,
        resetToken,
      });
    },
    onSuccess: () => {
      setMsg("رمز عبور با موفقیت تغییر کرد ✔");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    },
    onError: (err) => {
      setMsg(err.response?.data?.message || "تغییر رمز عبور ناموفق بود.");
    },
  });

  return (
    <div className="auth-screen" dir="rtl">
      <Link
        to="/home"
        className="auth-home-btn"
        aria-label="بازگشت به صفحه اصلی"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clip-rule="evenodd" d="M0.597917 6.70553C0 7.79788 0 9.11557 0 11.7509V13.5026C0 17.9949 0 20.2411 1.3492 21.6366C2.69839 23.0322 4.86989 23.0322 9.21289 23.0322H13.8193C18.1623 23.0322 20.3338 23.0322 21.683 21.6366C23.0322 20.2411 23.0322 17.9949 23.0322 13.5026V11.7509C23.0322 9.11557 23.0322 7.79788 22.4343 6.70553C21.8364 5.61319 20.744 4.93525 18.5593 3.57935L16.2561 2.14991C13.9467 0.716636 12.792 0 11.5161 0C10.2402 0 9.08551 0.716636 6.77612 2.14991L4.4729 3.57935C2.28819 4.93525 1.19583 5.61319 0.597917 6.70553ZM8.06128 17.5621C7.58427 17.5621 7.19757 17.9488 7.19757 18.4258C7.19757 18.9028 7.58427 19.2895 8.06128 19.2895H14.9709C15.448 19.2895 15.8347 18.9028 15.8347 18.4258C15.8347 17.9488 15.448 17.5621 14.9709 17.5621H8.06128Z" fill="#999FA8"/>
        </svg>

      </Link>

      <button
        type="button"
        className="auth-back-btn"
        aria-label="بازگشت"
        onClick={() => navigate(returnUrl?.startsWith("/") ? returnUrl : -1)}
      >
        <svg width="7" height="14" viewBox="0 0 7 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.750006 12.5479L2.9425 10.5464C4.93607 8.72654 5.93286 7.8166 5.93286 6.64897C5.93286 5.48134 4.93607 4.57139 2.9425 2.7515L0.750007 0.750021" stroke="#999FA8" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>

      </button>

      <div className="auth-screen__inner">
        <div className="auth-hero">
          <img src="/images/cake-auth.png" alt="" className="auth-hero-img" />
        </div>

        <StepProgress step={step} total={3} />

        {/* STEP 1: PHONE */}
        {step === 1 && (
          <>
            <div className="auth-copy">
              <h1 className="auth-heading">
                بازیابی <span className="accent">رمز عبور</span>
              </h1>
              <p className="auth-subtitle">
                شماره همراه خود را وارد کنید تا کد تأیید برایتان ارسال شود.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^\d{11}$/.test(phone)) {
                  setMsg("شماره تلفن باید ۱۱ رقم باشد.");
                  return;
                }
                setMsg("");
                sendOtp.mutate(phone);
              }}
            >
              <div className="auth-field">
                <label className="auth-label">شماره همراه</label>
                <input
                  className="auth-input"
                  inputMode="tel"
                  placeholder="09xxxxxxxxx"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/[^\d]/g, ""))
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

        {/* STEP 2: CODE */}
        {step === 2 && (
          <>
            <div className="auth-copy">
              <h1 className="auth-heading">
                کد <span className="accent">تأیید</span> را وارد کنید
              </h1>
              <p className="auth-subtitle">
                کد ۵ رقمی ارسال‌شده به شماره {phone} را وارد کنید.
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
                verifyOtp.mutate({ phoneNumber: phone, code });
              }}
            >
              <OTP length={5} onValue={setCode} />

              <button
                className="auth-btn auth-btn-primary mt-16"
                type="submit"
                disabled={verifyOtp.isPending || code.length !== 5}
              >
                {verifyOtp.isPending ? "در حال بررسی..." : "تأیید کد"}
              </button>

              {msg && <p className="auth-message">{msg}</p>}

              <div className="auth-footer">
                <button
                  type="button"
                  className="auth-chip-btn"
                  onClick={() => sendOtp.mutate(phone)}
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

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <>
            <div className="auth-copy">
              <h1 className="auth-heading">
                تعیین <span className="accent">رمز</span> جدید
              </h1>
              <p className="auth-subtitle">رمز عبور جدید خود را انتخاب کنید.</p>
            </div>

            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (pass.length < 6) {
                  setMsg("رمز باید حداقل ۶ کاراکتر باشد.");
                  return;
                }
                if (pass !== confirm) {
                  setMsg("رمزها یکسان نیستند.");
                  return;
                }
                if (!resetToken) {
                  // Shouldn't normally happen — it means step 2 never
                  // actually completed a fresh verification for this
                  // phone number. Send them back rather than letting the
                  // request go out without proof.
                  setMsg(
                    "نشست بازیابی رمز منقضی شده؛ لطفاً دوباره کد تأیید را دریافت کنید.",
                  );
                  setStep(1);
                  return;
                }
                setMsg("");
                resetPassword.mutate({
                  phoneNumber: phone,
                  newPassword: pass,
                  newPasswordConfirm: confirm,
                  resetToken,
                });
              }}
            >
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
                <label className="auth-label">تکرار رمز</label>
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
                disabled={resetPassword.isPending}
              >
                {resetPassword.isPending ? "در حال ثبت..." : "ثبت رمز جدید"}
              </button>

              {msg && (
                <p
                  className={`auth-message ${
                    resetPassword.isSuccess ? "success" : ""
                  }`}
                >
                  {msg}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

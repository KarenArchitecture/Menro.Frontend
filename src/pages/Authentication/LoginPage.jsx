import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import authAxios from "../../api/authAxios";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
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

export default function LoginPage() {
  useDocumentTitle("ورود");
  const navigate = useNavigate();
  const location = useLocation();
  const { completeLogin } = useAuth();

  const params = new URLSearchParams(location.search);
  const returnUrl = params.get("returnUrl");

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("otp"); // "otp" | "password"
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
      // Rate-limit responses ("too soon since the last code") land here
      // too — the backend is the single source of truth for cooldowns,
      // so we just surface whatever message it sends back.
      setMsg(
        err.response?.data?.message ||
          "خطا در ارسال کد، لطفاً دوباره تلاش کنید.",
      );
    },
  });

  /* shared handler for the login response, 
    used by both OTP and password login */
  const handleVerified = async (data) => {
    if (data.needsRegister) {
      localStorage.setItem(
        "userPhone",
        JSON.stringify({
          value: phone,
          registrationTicket: data.registrationTicket, // 👈 جدید
          expiresAt: Date.now() + 10 * 60 * 1000, // 10 دقیقه
        }),
      );
      navigate(
        `/register${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`,
        { replace: true },
      );
      return;
    }

    setMsg("");

    try {
      await completeLogin(data.accessToken);
      navigate(returnUrl?.startsWith("/") ? returnUrl : "/", {
        replace: true,
      });
    } catch (err) {
      setMsg(err.message || "ورود به حساب با خطا مواجه شد.");
    }
  };

  /* 2) verify OTP + log in */
  const verifyOtp = useMutation({
    mutationFn: async ({ phoneNumber, code }) => {
      const { data } = await authAxios.post("/login/otp", {
        phoneNumber,
        code,
      });
      return data;
    },
    onSuccess: handleVerified,
    onError: (err) =>
      setMsg(err.response?.data?.message || "کد وارد شده صحیح نیست."),
  });

  /* 2b) login with phone + password (no OTP step) */
  const passwordLogin = useMutation({
    mutationFn: async ({ phoneNumber, password }) => {
      const { data } = await authAxios.post("/login/password", {
        phoneNumber,
        password,
      });
      return data;
    },
    onSuccess: handleVerified,
    onError: (err) =>
      setMsg(err.response?.data?.message || "شماره یا رمز عبور اشتباه است."),
  });

  const continueAsGuest = () => {
    navigate(returnUrl?.startsWith("/") ? returnUrl : "/", { replace: true });
  };

  const switchMode = (next) => {
    setMode(next);
    setMsg("");
  };

  return (
    <div className="auth-screen" dir="rtl">
      <Link
        to="/home"
        className="auth-home-btn"
        aria-label="بازگشت به صفحه اصلی"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M0.597917 6.70553C0 7.79788 0 9.11557 0 11.7509V13.5026C0 17.9949 0 20.2411 1.3492 21.6366C2.69839 23.0322 4.86989 23.0322 9.21289 23.0322H13.8193C18.1623 23.0322 20.3338 23.0322 21.683 21.6366C23.0322 20.2411 23.0322 17.9949 23.0322 13.5026V11.7509C23.0322 9.11557 23.0322 7.79788 22.4343 6.70553C21.8364 5.61319 20.744 4.93525 18.5593 3.57935L16.2561 2.14991C13.9467 0.716636 12.792 0 11.5161 0C10.2402 0 9.08551 0.716636 6.77612 2.14991L4.4729 3.57935C2.28819 4.93525 1.19583 5.61319 0.597917 6.70553ZM8.06128 17.5621C7.58427 17.5621 7.19757 17.9488 7.19757 18.4258C7.19757 18.9028 7.58427 19.2895 8.06128 19.2895H14.9709C15.448 19.2895 15.8347 18.9028 15.8347 18.4258C15.8347 17.9488 15.448 17.5621 14.9709 17.5621H8.06128Z" fill="#999FA8"/>
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
        <svg width="7" height="14" viewBox="0 0 7 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.750006 12.5479L2.9425 10.5464C4.93607 8.72654 5.93286 7.8166 5.93286 6.64897C5.93286 5.48134 4.93607 4.57139 2.9425 2.7515L0.750007 0.750021" stroke="#999FA8" stroke-width="1.5" stroke-linecap="round"/>
        </svg>

      </button>

      <div className="auth-screen__inner">
        <div className="auth-hero">
          <img
            src={
              step === 1 ? "/images/burger-auth.png" : "/images/cake-auth.png"
            }
            alt=""
            className="auth-hero-img"
          />
        </div>

        {/* STEP 1: PHONE (or PHONE + PASSWORD) */}
        {step === 1 && (
          <>
            <div className="auth-copy">
              <h1 className="auth-heading">
                <span className="accent"> به منرو</span> خوش آمدید
              </h1>
              <p className="auth-subtitle">
                با ایجاد حساب کاربری در منو می‌توانید از امکانات ویژه نرم‌افزار
                استفاده کنید!
              </p>
            </div>

            <div className="auth-mode-tabs">
              <button
                type="button"
                className={`auth-mode-tab ${mode === "otp" ? "is-active" : ""}`}
                onClick={() => switchMode("otp")}
              >
                ورود با کد یکبار مصرف
              </button>
              <button
                type="button"
                className={`auth-mode-tab ${mode === "password" ? "is-active" : ""}`}
                onClick={() => switchMode("password")}
              >
                ورود با رمز عبور
              </button>
            </div>

            {mode === "otp" ? (
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
                  {sendOtp.isPending ? "در حال ارسال..." : "تأیید و ادامه"}
                </button>

                {msg && <p className="auth-message">{msg}</p>}

                <div className="auth-footer">
                  <button
                    type="button"
                    className="auth-chip-btn"
                    onClick={continueAsGuest}
                  >
                    ادامه به عنوان مهمان
                  </button>
                </div>
              </form>
            ) : (
              <form
                className="auth-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!/^\d{11}$/.test(phone)) {
                    setMsg("شماره تلفن باید ۱۱ رقم باشد.");
                    return;
                  }
                  if (!password) {
                    setMsg("رمز عبور را وارد کنید.");
                    return;
                  }
                  setMsg("");
                  passwordLogin.mutate({ phoneNumber: phone, password });
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

                <div className="auth-field">
                  <label className="auth-label">رمز عبور</label>
                  <input
                    type="password"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  className="auth-btn auth-btn-primary"
                  type="submit"
                  disabled={passwordLogin.isPending}
                >
                  {passwordLogin.isPending ? "در حال ورود..." : "ورود به حساب"}
                </button>

                {msg && <p className="auth-message">{msg}</p>}

                <div className="auth-footer">
                  <Link to="/forgot-password" className="auth-chip-btn">
                    فراموشی رمز عبور
                  </Link>
                  <button
                    type="button"
                    className="auth-chip-btn"
                    onClick={continueAsGuest}
                  >
                    ادامه به عنوان مهمان
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* STEP 2: CODE */}
        {step === 2 && (
          <>
            <div className="auth-copy">
              <h1 className="auth-heading">
                <span className="accent">منو</span> بهترین همیار رستوران تو
              </h1>
              <p className="auth-subtitle">
                بهترین رستوران‌ها را با منو پیدا کن و سفارشت را به‌راحتی ثبت کن!
              </p>
            </div>

            <p className="auth-otp-caption">
              کد ۵ رقمی ارسال‌شده به شماره <strong>{phone}</strong> را وارد کنید
            </p>

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
                {verifyOtp.isPending ? "در حال بررسی..." : "ورود به حساب"}
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
                <button
                  type="button"
                  className="auth-chip-btn"
                  onClick={continueAsGuest}
                >
                  ادامه به عنوان مهمان
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

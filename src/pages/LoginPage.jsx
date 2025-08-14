import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import usePageStyles from "../hooks/usePageStyles";
import authAxios from "../api/authAxios";

export default function LoginPage() {
  /* loginpage CSS (/public) */
  usePageStyles("/styles-login.css");
  const navigate = useNavigate();

  /* -------------------------------
   * local UI state
   * ----------------------------- */
  const [tab, setTab] = useState("otp"); // "otp" | "password"
  const [phone, setPhone] = useState(""); // otp tab
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [pwPhone, setPwPhone] = useState(""); // password tab
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState({ text: "", type: "" }); // success | error
  const showMsg = (text, type = "error") => setMsg({ text, type });
  const clearMsg = () => setMsg({ text: "", type: "" });

  //otp timer
  const [resendTimer, setResendTimer] = useState(0);

  /* clear message when user switches tab */
  useEffect(() => clearMsg(), [tab]);
  // otp use effects
  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer > 0]);
  useEffect(() => {
    const expiry = localStorage.getItem("otpTimerExpiry");
    if (expiry) {
      const timeLeft = Math.floor((+expiry - Date.now()) / 1000);
      if (timeLeft > 0) {
        setOtpSent(true);
        setResendTimer(timeLeft);
      } else {
        localStorage.removeItem("otpTimerExpiry");
        setOtpSent(false);
      }
    }
  }, []);

  /* mutations (TanStack Query)*/

  /* 1) send OTP */
  const sendOtp = useMutation({
    mutationFn: async (phoneNumber) => {
      try {
        await authAxios.post("/send-otp", { phoneNumber });
      } catch (err) {
        // اگه بک‌اند message برمی‌گردونه
        const message = err.response?.data?.message || "خطا در ارسال کد.";
        throw new Error(message);
      }
    },
    onSuccess: () => {
      setOtpSent(true);
      setResendTimer(5);
      const expiry = Date.now() + 5 * 1000;
      localStorage.setItem("otpTimerExpiry", expiry.toString());
      showMsg("کد تأیید ارسال شد.", "success");
    },
    onError: (err) => showMsg(err.message),
  });

  /* 2) verify OTP & login */
  const verifyOtp = useMutation({
    mutationFn: ({ phoneNumber, code }) =>
      authAxios
        .post("/login-otp", { phoneNumber, code })
        .then((res) => res.data)
        .catch((err) => {
          const message =
            err.response?.data?.message || "کد وارد شده صحیح نیست.";
          throw new Error(message);
        }),
    onSuccess: (data) => {
      if (data.needsRegister) {
        const expiresAt = Date.now() + 60_000; // 60 s
        localStorage.setItem(
          "userPhone",
          JSON.stringify({ value: phone, expiresAt })
        );
        navigate("/register");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      }
    },
    onError: (err) => showMsg(err.message),
  });

  /* 3) login with password */
  const loginWithPassword = useMutation({
    mutationFn: ({ phoneNumber, password }) =>
      authAxios
        .post("/login-password", { phoneNumber, password })
        .then((res) => res.data)
        .catch((err) => {
          const message = err.response?.data?.message || "ورود ناموفق بود";
          throw new Error(message);
        }),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    },
    onError: (err) => showMsg(err.message),
  });

  /* handlers */

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    clearMsg();

    if (!/^\d{11}$/.test(phone)) {
      showMsg("لطفاً یک شماره تلفن ۱۱ رقمی معتبر وارد کنید");
      return;
    }

    if (!otpSent) {
      if (resendTimer > 0) {
        showMsg("لطفاً چند لحظه صبر کنید تا ارسال مجدد مجاز شود.");
        return;
      }
      sendOtp.mutate(phone);
    } else {
      if (code.length !== 4) {
        showMsg("کد باید ۴ رقم باشد.");
        return;
      }
      verifyOtp.mutate({ phoneNumber: phone, code });
    }
  };
  const handleResendCode = () => {
    if (resendTimer > 0) return;
    if (!/^\d{11}$/.test(phone)) {
      showMsg("شماره موبایل معتبر نیست.");
      return;
    }
    sendOtp.mutate(phone);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    clearMsg();

    if (!pwPhone) return showMsg("شماره تلفن الزامی است");
    if (!password) return showMsg("رمز عبور نمی‌تواند خالی باشد");

    loginWithPassword.mutate({ phoneNumber: pwPhone, password });
  };

  /* render */

  return (
    <div className="login-container">
      <div className="form-content">
        <h1>ورود یا ثبت‌نام</h1>

        {/* tab buttons */}
        <div className="login-tabs">
          <button
            className={`tab ${tab === "otp" ? "active" : ""}`}
            onClick={() => setTab("otp")}
          >
            ورود با کد یکبار مصرف
          </button>
          <button
            className={`tab ${tab === "password" ? "active" : ""}`}
            onClick={() => setTab("password")}
          >
            ورود با رمز عبور
          </button>
        </div>

        {/* OTP FORM */}
        {tab === "otp" && (
          <form className="login-form active-form" onSubmit={handleOtpSubmit}>
            {/* phone field */}
            <div className="input-group">
              <label htmlFor="phone">شماره تلفن</label>
              <input
                id="phone"
                type="tel"
                placeholder="09123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                readOnly={otpSent}
              />
            </div>

            {/* code field (after first request) */}
            {otpSent && (
              <div className="input-group">
                <label htmlFor="code">کد تأیید ۴ رقمی</label>
                <input
                  id="code"
                  type="text"
                  maxLength="4"
                  placeholder="----"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={
                sendOtp.isPending ||
                verifyOtp.isPending ||
                (!otpSent && resendTimer > 0)
              }
            >
              {sendOtp.isPending || verifyOtp.isPending
                ? "در حال ارسال…"
                : otpSent
                ? "تایید کد"
                : "ادامه"}
            </button>

            {otpSent && (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                className={`resend-btn ${
                  resendTimer > 0 ? "disabled" : "active"
                }`}
              >
                {resendTimer > 0
                  ? `ارسال مجدد کد تا ${resendTimer} ثانیه دیگر`
                  : "ارسال مجدد کد"}
              </button>
            )}
          </form>
        )}

        {/* PASSWORD FORM */}
        {tab === "password" && (
          <form
            className="login-form active-form"
            onSubmit={handlePasswordSubmit}
          >
            <div className="input-group">
              <label htmlFor="pw-phone">ایمیل یا شماره تلفن</label>
              <input
                id="pw-phone"
                type="text"
                value={pwPhone}
                onChange={(e) => setPwPhone(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="pw-pass">رمز عبور</label>
              <input
                id="pw-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loginWithPassword.isPending}>
              {loginWithPassword.isPending ? "در حال ارسال…" : "ورود"}
            </button>
            {/* Forgot password link */}
            <div className="forgot-password-link">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="link-btn"
              >
                رمز عبور را فراموش کرده‌اید؟
              </button>
            </div>
          </form>
        )}

        {/* message area */}
        {msg.text && <p className={`message ${msg.type}`}>{msg.text}</p>}
      </div>
    </div>
  );
}

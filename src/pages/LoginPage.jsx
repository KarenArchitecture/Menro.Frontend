import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import usePageStyles from "../hooks/usePageStyles";

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

  /* clear message when user switches tab */
  useEffect(() => clearMsg(), [tab]);

  /* mutations (TanStack Query)*/

  /* 1) send OTP */
  const sendOtp = useMutation({
    mutationFn: (phoneNumber) =>
      fetch("https://localhost:7270/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      }).then(async (res) => {
        if (!res.ok) {
          const { message = "خطا در ارسال کد." } = await res.json();
          throw new Error(message);
        }
      }),
    onSuccess: () => {
      setOtpSent(true);
      showMsg("کد تأیید ارسال شد.", "success");
    },
    onError: (err) => showMsg(err.message),

    /*fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      }).then(async (res) => {
        if (!res.ok) {
          const { message = "خطا در ارسال کد." } = await res.json();
          throw new Error(message);
        }
      }),
    onSuccess: () => {
      setOtpSent(true);
      showMsg("کد تأیید ارسال شد.", "success");
    },
    onError: (err) => showMsg(err.message),*/
  });

  /* 2) verify OTP & login */
  const verifyOtp = useMutation({
    mutationFn: ({ phoneNumber, code }) =>
      fetch("/api/auth/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "کد وارد شده صحیح نیست.");
        return data;
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
      fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, password }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "ورود ناموفق بود");
        return data;
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
      sendOtp.mutate(phone);
    } else {
      if (code.length !== 4) {
        showMsg("کد باید ۴ رقم باشد.");
        return;
      }
      verifyOtp.mutate({ phoneNumber: phone, code });
    }
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
              disabled={sendOtp.isPending || verifyOtp.isPending}
            >
              {sendOtp.isPending || verifyOtp.isPending
                ? "در حال ارسال…"
                : otpSent
                ? "تایید کد"
                : "ادامه"}
            </button>
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
          </form>
        )}

        {/* message area */}
        {msg.text && <p className={`message ${msg.type}`}>{msg.text}</p>}
      </div>
    </div>
  );
}

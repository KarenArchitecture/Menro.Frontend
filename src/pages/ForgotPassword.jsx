import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import authAxios from "../api/authAxios";
import usePageStyles from "../hooks/usePageStyles";
/* ────────────────────────────────
function OTP({ length = 6, onValue }) {
──────────────────────────────── */

function OTP({ length = 6, onValue }) {
  const refs = useRef([]);
  const [boxes, setBoxes] = useState(Array(length).fill(""));

  const update = (i, v) => {
    const next = [...boxes];
    next[i] = v.replace(/\D/g, "").slice(0, 1);
    setBoxes(next);
    onValue(next.join(""));
    if (next[i] && refs.current[i + 1]) refs.current[i + 1].focus();
  };

  return (
    <div className="otp-row" dir="ltr">
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
  );
}

export default function ForgotPassword() {
  usePageStyles("/forgot-password.css");

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  /* 1) send OTP */
  const sendOtp = useMutation({
    mutationFn: async (phoneNumber) => {
      const { data } = await authAxios.post("/send-otp", { phoneNumber });
      return data;
    },
    onSuccess: () => {
      setMsg("کد تأیید ارسال شد ✅");
      setStep(2);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        "خطا در ارسال کد، لطفاً دوباره تلاش کنید.";
      setMsg(msg);
    },
  });

  /* 2) verify OTP */
  const verifyOtp = useMutation({
    mutationFn: async ({ phoneNumber, code }) => {
      const payload = {
        phoneNumber,
        method: "otp",
        codeOrPassword: code,
      };
      const { data } = await authAxios.post("/verify", payload);
      return data;
    },
    onSuccess: (data) => {
      if (data.verified) {
        setMsg("کد تأیید شد ✅");
        setStep(3);
      } else {
        setMsg("کد وارد شده معتبر نیست.");
      }
    },
    onError: (err) =>
      setMsg(err.response?.data?.message || "کد وارد شده صحیح نیست."),
  });

  /* 3) reset password */
  const resetPassword = useMutation({
    mutationFn: async ({ phoneNumber, newPassword, newPasswordConfirm }) => {
      await authAxios.post("/reset-password", {
        phoneNumber,
        newPassword,
        newPasswordConfirm,
      });
    },
    onSuccess: () => {
      setMsg("رمز عبور با موفقیت تغییر کرد ✅");
      setTimeout(() => {
        // بازگشت به صفحه ورود
        window.location.href = "/login";
      }, 1200);
    },
    onError: (err) => {
      setMsg(err.response?.data?.message || "تغییر رمز عبور ناموفق بود.");
    },
  });

  return (
    <section className="auth-wrap" dir="rtl">
      <div className="auth-card">
        <h1 className="auth-title">فراموشی رمز عبور</h1>

        {/* Progress Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${step === 1 ? "is-active" : ""}`}>
            شماره
          </button>
          <button
            className={`auth-tab ${step === 2 ? "is-active" : ""}`}
            disabled
          >
            کد
          </button>
          <button
            className={`auth-tab ${step === 3 ? "is-active" : ""}`}
            disabled
          >
            رمز جدید
          </button>
        </div>

        {/* STEP 1: PHONE */}
        {step === 1 && (
          <form
            className="auth-body"
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
            <label className="auth-label">شماره تلفن</label>
            <input
              className="auth-input"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
              required
            />
            <button
              className="btn btn-primary mt-16"
              type="submit"
              disabled={sendOtp.isPending}
            >
              {sendOtp.isPending ? "در حال ارسال..." : "ارسال کد"}
            </button>
            {msg && <p className="form-message">{msg}</p>}
          </form>
        )}

        {/* STEP 2: CODE */}
        {step === 2 && (
          <form
            className="auth-body"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.length !== 6) {
                setMsg("کد باید ۶ رقم باشد.");
                return;
              }
              setMsg("");
              verifyOtp.mutate({ phoneNumber: phone, code });
            }}
          >
            <p className="auth-label">کد ارسال شده به {phone}</p>
            <OTP length={6} onValue={setCode} />

            <div className="row gap">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => sendOtp.mutate(phone)}
              >
                ارسال مجدد
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={verifyOtp.isPending || code.length !== 6}
              >
                {verifyOtp.isPending ? "در حال بررسی..." : "تأیید کد"}
              </button>
            </div>
            {msg && <p className="form-message">{msg}</p>}
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form
            className="auth-body"
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
              setMsg("");
              resetPassword.mutate({
                phoneNumber: phone,
                newPassword: pass,
                newPasswordConfirm: confirm,
              });
            }}
          >
            <label className="auth-label">رمز جدید</label>
            <input
              type="password"
              className="auth-input"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              minLength={6}
            />

            <label className="auth-label">تکرار رمز</label>
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
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? "در حال ثبت..." : "ثبت رمز جدید"}
            </button>
            {msg && <p className="form-message">{msg}</p>}
          </form>
        )}
      </div>
    </section>
  );
}

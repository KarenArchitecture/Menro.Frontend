import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import authAxios from "../api/authAxios";
import usePageStyles from "../hooks/usePageStyles";

function OTP({ length = 4, onValue }) {
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

  /* 1) send OTP */
  const sendOtp = useMutation({
    mutationFn: async (phoneNumber) => {
      try {
        await authAxios.post("/send-otp", { phoneNumber });
      } catch (err) {
        const message = err.response?.data?.message || "خطا در ارسال کد.";
        throw new Error(message);
      }
    },
    onSuccess: () => {
      alert("کد تأیید ارسال شد.");
      setStep(2);
    },
    onError: (err) => alert(err.message),
  });

  /* 2) verify OTP */
  const verifyOtp = useMutation({
    mutationFn: async ({ phoneNumber, code }) => {
      try {
        await authAxios.post("/verify-otp", { phoneNumber, code });
      } catch (err) {
        const message = err.response?.data?.message || "کد وارد شده صحیح نیست.";
        throw new Error(message);
      }
    },
    onSuccess: () => {
      alert("کد تأیید شد.");
      setStep(3);
    },
    onError: (err) => alert(err.message),
  });

  /* 3) reset password */
  const resetPassword = useMutation({
    mutationFn: async ({ phoneNumber, newPassword, newPasswordConfirm }) => {
      try {
        await authAxios.post("/reset-password", {
          phoneNumber,
          newPassword,
          newPasswordConfirm,
        });
      } catch (err) {
        const message =
          err.response?.data?.message || "تغییر رمز عبور ناموفق بود.";
        throw new Error(message);
      }
    },
    onSuccess: () => {
      alert("رمز عبور با موفقیت تغییر کرد.");
      setStep(1);
      setPhone("");
      setCode("");
      setPass("");
      setConfirm("");
    },
    onError: (err) => alert(err.message),
  });

  return (
    <section className="auth-wrap" dir="rtl">
      <div className="auth-card">
        <h1 className="auth-title">فراموشی رمز عبور</h1>

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
              if (phone.length !== 11) {
                alert("شماره تلفن باید ۱۱ رقم باشد.");
                return;
              }
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
            <button className="btn btn-primary mt-16" type="submit">
              ارسال کد
            </button>
          </form>
        )}

        {/* STEP 2: CODE */}
        {step === 2 && (
          <form
            className="auth-body"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.length !== 4) {
                alert("کد باید ۴ رقم باشد.");
                return;
              }
              verifyOtp.mutate({ phoneNumber: phone, code });
            }}
          >
            <p className="auth-label">کد ارسال شده به {phone}</p>
            <OTP length={4} onValue={setCode} />

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
                disabled={code.length !== 4}
              >
                تایید کد
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form
            className="auth-body"
            onSubmit={(e) => {
              e.preventDefault();
              if (pass.length < 6) {
                alert("رمز باید حداقل ۶ کاراکتر باشد.");
                return;
              }
              if (pass !== confirm) {
                alert("رمزها یکسان نیستند.");
                return;
              }
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

            <button className="btn btn-primary mt-16" type="submit">
              ثبت رمز جدید
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

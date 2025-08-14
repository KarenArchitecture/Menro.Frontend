import React, { useRef, useState } from "react";
import usePageStyles from "../hooks/usePageStyles";

function OTP({ length = 5, onValue }) {
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
          name={`code_${i + 1}`}
        />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  usePageStyles("/forgot-password.css");
  // steps: 1=phone, 2=code, 3=new password
  const [step, setStep] = useState(1);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <section className="auth-wrap" dir="rtl">
      <div className="auth-card">
        <h1 className="auth-title">فراموشی رمز عبور</h1>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${step === 1 ? "is-active" : ""}`}
            type="button"
          >
            شماره
          </button>
          <button
            className={`auth-tab ${step === 2 ? "is-active" : ""}`}
            type="button"
            disabled
          >
            کد
          </button>
          <button
            className={`auth-tab ${step === 3 ? "is-active" : ""}`}
            type="button"
            disabled
          >
            رمز جدید
          </button>
        </div>

        {/* STEP 1: PHONE */}
        {step === 1 && (
          <form
            className="auth-body"
            method="post"
            action="/auth/forgot/request"
            data-endpoint="/auth/forgot/request"
            onSubmit={(e) => {
              e.preventDefault();
              if (phone.length !== 11) {
                alert("شماره تلفن باید ۱۱ رقم باشد.");
                return;
              }
              setStep(2);
            }}
          >
            <label className="auth-label" htmlFor="fp-phone">
              شماره تلفن
            </label>
            <input
              id="fp-phone"
              className="auth-input"
              name="phone"
              placeholder="09123456789"
              inputMode="tel"
              autoComplete="tel"
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
            method="post"
            action="/auth/forgot/verify"
            data-endpoint="/auth/forgot/verify"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(3);
            }}
          >
            {/* keep phone for backend */}
            <input type="hidden" name="phone" value={phone} />

            <p className="auth-label">کد ارسال شده به {phone}</p>

            {/* unified code in hidden input, plus per-box names (code_1..n) */}
            <input type="hidden" name="code" value={code} />
            <OTP length={5} onValue={setCode} />

            <div className="row gap">
              <button className="btn btn-secondary" type="button">
                ارسال مجدد
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={code.length !== 5}
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
            method="post"
            action="/auth/forgot/reset"
            data-endpoint="/auth/forgot/reset"
            onSubmit={(e) => {
              e.preventDefault(); // frontend-only demo
              if (pass.length < 6)
                return alert("رمز باید حداقل ۶ کاراکتر باشد.");
              if (pass !== confirm) return alert("رمزها یکسان نیستند.");
              alert("رمز با موفقیت تنظیم شد.");
            }}
          >
            {/* phone + code for backend to match the request */}
            <input type="hidden" name="phone" value={phone} />
            <input type="hidden" name="code" value={code} />

            <label className="auth-label" htmlFor="fp-pass">
              رمز جدید
            </label>
            <input
              id="fp-pass"
              type="password"
              className="auth-input"
              name="password"
              autoComplete="new-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              minLength={6}
            />

            <label className="auth-label" htmlFor="fp-confirm">
              تکرار رمز
            </label>
            <input
              id="fp-confirm"
              type="password"
              className="auth-input"
              name="confirmPassword"
              autoComplete="new-password"
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

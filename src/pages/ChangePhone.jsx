import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import authAxios from "../api/authAxios";
import usePageStyles from "../hooks/usePageStyles";
import { useNavigate } from "react-router-dom";
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

export default function ChangePhone() {
  usePageStyles("/forgot-password.css");
  const [newPhone, setNewPhone] = useState("");
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

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
        operation: "change-phone",
      };

      const { data } = await authAxios.post("/verify", payload);
      return data;
    },
    onSuccess: (data) => {
      if (data.verified) {
        setMsg("کد تأیید شد ✅");

        // ⭐ مرحله مهم: کال متد تغییر شماره
        changePhone.mutate(newPhone);

        // ❌ نیازی به navigate نیست
        // این در changePhone.onSuccess انجام می‌شود
      } else {
        setMsg("کد وارد شده معتبر نیست.");
      }
    },
    onError: (err) =>
      setMsg(err.response?.data?.message || "کد وارد شده صحیح نیست."),
  });

  /* 3) change phone */
  const changePhone = useMutation({
    mutationFn: async (newPhone) => {
      const payload = { newPhone }; // مطابق DTO بک‌اند
      await authAxios.put("/change-phone", payload);
    },
    onSuccess: () => {
      setMsg("شماره با موفقیت تغییر کرد ✔");

      setTimeout(() => {
        navigate("/admin");
      }, 800);
    },
    onError: (err) => {
      setMsg(err.response?.data?.message || "تغییر شماره ناموفق بود.");
    },
  });

  return (
    <section className="auth-wrap" dir="rtl">
      <div className="auth-card">
        <h1 className="auth-title">تغییر شماره همراه</h1>

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
        </div>

        {/* STEP 1: PHONE */}
        {step === 1 && (
          <form
            className="auth-body"
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
            <label className="auth-label">شماره تلفن</label>
            <input
              className="auth-input"
              inputMode="tel"
              value={newPhone}
              onChange={(e) =>
                setNewPhone(e.target.value.replace(/[^\d]/g, ""))
              }
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
              verifyOtp.mutate({
                phoneNumber: newPhone,
                code,
                operation: "change-phone",
              });
            }}
          >
            <p className="auth-label">کد ارسال شده به {newPhone}</p>
            <OTP length={6} onValue={setCode} />

            <div className="row gap">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => sendOtp.mutate(newPhone)}
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
      </div>
    </section>
  );
}

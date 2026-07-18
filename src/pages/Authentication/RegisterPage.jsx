import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../assets/css/auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationTicket, setRegistrationTicket] = useState(""); // 👈 جدید
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });

  /* pre-fill phone + ticket from localStorage */
  useEffect(() => {
    const raw = localStorage.getItem("userPhone");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const saved = JSON.parse(raw);
      const stillValid =
        saved.value && saved.registrationTicket && Date.now() < saved.expiresAt;

      if (stillValid) {
        setPhone(saved.value);
        setRegistrationTicket(saved.registrationTicket);
      } else {
        localStorage.removeItem("userPhone");
        navigate("/login", { replace: true });
      }
    } catch {
      localStorage.removeItem("userPhone");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const returnUrl = params.get("returnUrl");

  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      return await registerUser(payload);
    },
    onSuccess: () => {
      navigate(returnUrl?.startsWith("/") ? returnUrl : "/", {
        replace: true,
      });
    },
    onError: (err) => {
      setMsg({ text: err.message, type: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    if (!fullName.trim()) {
      setMsg({ text: "وارد کردن نام الزامی است", type: "error" });
      return;
    }

    if (!registrationTicket) {
      // نشست تأیید شماره منقضی شده؛ باید دوباره کد بگیره
      setMsg({
        text: "نشست ثبت‌نام منقضی شده؛ لطفاً دوباره شماره را تأیید کنید.",
        type: "error",
      });
      navigate("/login", { replace: true });
      return;
    }

    registerMutation.mutate({
      fullName,
      phoneNumber: phone,
      email,
      password,
      registrationTicket, // 👈 جدید — بدون این، بک‌اند رد می‌کنه
    });
  };

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

        <div className="auth-copy">
          <h1 className="auth-heading">
            تکمیل <span className="accent">اطلاعات</span> کاربری
          </h1>
          <p className="auth-subtitle">
            برای ادامه، لطفاً اطلاعات خود را وارد کنید.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="name">
              نام و نام خانوادگی
            </label>
            <input
              id="name"
              type="text"
              className="auth-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="phone">
              شماره تلفن
            </label>
            <input
              id="phone"
              type="text"
              className="auth-input"
              value={phone}
              readOnly
            />
            <p className="auth-input-hint">شماره از مرحله قبل تأیید شده است.</p>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              ایمیل (اختیاری)
            </label>
            <input
              id="email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pass">
              رمز عبور (اختیاری)
            </label>
            <input
              id="pass"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="auth-input-hint">
              با انتخاب رمز عبور، حساب خود را امن‌تر کنید.
            </p>
          </div>

          <button
            className="auth-btn auth-btn-primary"
            type="submit"
            disabled={registerMutation.isLoading}
          >
            {registerMutation.isLoading ? "در حال ارسال…" : "ثبت‌نام"}
          </button>

          {msg.text && (
            <p
              className={`auth-message ${msg.type === "success" ? "success" : ""}`}
            >
              {msg.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../assets/css/auth.css";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function RegisterPage() {
  useDocumentTitle("ثبت نام");
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
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.597917 6.70553C0 7.79788 0 9.11557 0 11.7509V13.5026C0 17.9949 0 20.2411 1.3492 21.6366C2.69839 23.0322 4.86989 23.0322 9.21289 23.0322H13.8193C18.1623 23.0322 20.3338 23.0322 21.683 21.6366C23.0322 20.2411 23.0322 17.9949 23.0322 13.5026V11.7509C23.0322 9.11557 23.0322 7.79788 22.4343 6.70553C21.8364 5.61319 20.744 4.93525 18.5593 3.57935L16.2561 2.14991C13.9467 0.716636 12.792 0 11.5161 0C10.2402 0 9.08551 0.716636 6.77612 2.14991L4.4729 3.57935C2.28819 4.93525 1.19583 5.61319 0.597917 6.70553ZM8.06128 17.5621C7.58427 17.5621 7.19757 17.9488 7.19757 18.4258C7.19757 18.9028 7.58427 19.2895 8.06128 19.2895H14.9709C15.448 19.2895 15.8347 18.9028 15.8347 18.4258C15.8347 17.9488 15.448 17.5621 14.9709 17.5621H8.06128Z"
            fill="#999FA8"
          />
        </svg>
      </Link>
      <button
        type="button"
        className="auth-back-btn"
        aria-label="بازگشت"
        onClick={() => navigate(returnUrl?.startsWith("/") ? returnUrl : -1)}
      >
        <svg
          width="7"
          height="14"
          viewBox="0 0 7 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.750006 12.5479L2.9425 10.5464C4.93607 8.72654 5.93286 7.8166 5.93286 6.64897C5.93286 5.48134 4.93607 4.57139 2.9425 2.7515L0.750007 0.750021"
            stroke="#999FA8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
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

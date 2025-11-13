import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import usePageStyles from "../hooks/usePageStyles";
import authAxios from "../api/authAxios";
import { useAuth } from "../Context/AuthContext";

export default function RegisterPage() {
  usePageStyles("/styles-register.css");
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });

  /* pre-fill phone from localStorage */
  useEffect(() => {
    const raw = localStorage.getItem("userPhone");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const saved = JSON.parse(raw);
      if (saved.value && Date.now() < saved.expiresAt) {
        setPhone(saved.value);
      } else {
        localStorage.removeItem("userPhone");
        navigate("/login", { replace: true });
      }
    } catch {
      localStorage.removeItem("userPhone");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* register mutation */
  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      return await registerUser(payload);
    },
    onSuccess: () => {
      navigate("/", { replace: true });
    },
    onError: (err) => {
      setMsg({ text: err.message, type: "error" });
    },
  });

  /* form submit */
  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    if (!fullName.trim()) {
      setMsg({ text: "وارد کردن نام الزامی است", type: "error" });
      return;
    }

    registerMutation.mutate({
      fullName,
      phoneNumber: phone,
      email,
      password,
    });
  };

  return (
    <div className="form-container">
      <form className="profile-form active-form" onSubmit={handleSubmit}>
        <h2>تکمیل اطلاعات کاربر</h2>
        <p>برای ادامه، لطفاً اطلاعات خود را وارد کنید.</p>

        <div className="input-group">
          <label htmlFor="name">نام و نام خانوادگی</label>
          <input
            id="name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="phone">شماره تلفن</label>
          <input id="phone" type="text" value={phone} readOnly />
          <small>شماره از مرحله قبل تأیید شده است.</small>
        </div>

        <div className="input-group">
          <label htmlFor="email">ایمیل (اختیاری)</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="pass">رمز عبور (اختیاری)</label>
          <input
            id="pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <small>با انتخاب رمز عبور، حساب خود را امن‌تر کنید.</small>
        </div>

        <button type="submit" disabled={registerMutation.isLoading}>
          {registerMutation.isLoading ? "در حال ارسال…" : "ثبت‌نام"}
        </button>

        {msg.text && <p className={`message ${msg.type}`}>{msg.text}</p>}
      </form>
    </div>
  );
}

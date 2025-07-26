import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import usePageStyles from "../hooks/usePageStyles";

export default function RegisterPage() {
  usePageStyles("/styles-register.css");

  const navigate = useNavigate();

  /* local form state */
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" }); // success | error

  /* pre‑fill phone if it exists in localStorage (optional)*/
  useEffect(() => {
    const raw = localStorage.getItem("userPhone");
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved.value && Date.now() < saved.expiresAt) {
        setPhone(saved.value);
      } else {
        localStorage.removeItem("userPhone");
      }
    } catch {
      localStorage.removeItem("userPhone");
    }
  }, []);

  /* register mutation */
  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ثبت‌نام ناموفق بود");
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("userPhone");
      navigate("/", { replace: true });
    },
    onError: (err) => setMsg({ text: err.message, type: "error" }),
  });

  /* form submit */
  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    /* basic checks */
    if (!fullName.trim()) {
      setMsg({ text: "وارد کردن نام الزامی است", type: "error" });
      return;
    }
    if (!/^\d{11}$/.test(phone)) {
      setMsg({ text: "شماره تلفن باید ۱۱ رقم باشد", type: "error" });
      return;
    }

    registerMutation.mutate({ fullName, phoneNumber: phone, email, password });
  };

  /* UI */
  return (
    <div className="form-container">
      <form className="profile-form active-form" onSubmit={handleSubmit}>
        <h2>تکمیل اطلاعات کاربر</h2>
        <p>برای تجربه بهتر، لطفا اطلاعات پروفایل خود را تکمیل کنید.</p>

        {/* name */}
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

        {/* phone */}
        <div className="input-group">
          <label htmlFor="phone">شماره تلفن</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09123456789"
            required
          />
        </div>

        {/* email */}
        <div className="input-group">
          <label htmlFor="email">ایمیل (اختیاری)</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* password */}
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

        {/* submit */}
        <button type="submit" disabled={registerMutation.isLoading}>
          {registerMutation.isLoading ? "در حال ارسال…" : "ذخیره اطلاعات"}
        </button>

        {/* message */}
        {msg.text && <p className={`message ${msg.type}`}>{msg.text}</p>}
      </form>
    </div>
  );
}

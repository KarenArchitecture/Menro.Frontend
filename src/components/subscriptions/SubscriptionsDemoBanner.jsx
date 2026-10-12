// src/components/subscriptions/SubscriptionsDemoBanner.jsx
import React, { useState } from "react";
import "../../assets/css/subscriptions/subscriptions-demo-banner.css";

const DEMO_FEATURES = [
  "امکان شماره ۵ با متن تقریبا طولانی",
  "امکان شماره ۹",
  "امکان شماره ۲",
  "امکان شماره ۱",
];

function CheckCircle() {
  return (
    <svg
      className="sub-demo__check"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M7.5 12.5l3 3 6-6.5" />
    </svg>
  );
}

export default function SubscriptionsDemoBanner({
  features = DEMO_FEATURES,
  note = "بهترین گزینه برای شروع و بررسی تمام ماژول‌های منرو",
  onSubmit = null,
}) {
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: wire this up to the real "request a demo" endpoint.
    if (onSubmit) {
      onSubmit({ phone, notes });
    } else {
      console.log("Demo request:", { phone, notes });
    }

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2200);
  };

  return (
    <section className="sub-demo">
      <div className="sub-demo__info">
        <h3 className="sub-demo__title">دمو</h3>

        <div className="sub-demo__price">
          <span className="sub-demo__price-value">رایگان</span>
          <span className="sub-demo__price-unit">/ ۳ روز</span>
        </div>

        <p className="sub-demo__note">{note}</p>
      </div>

      <ul className="sub-demo__features">
        {features.map((f, i) => (
          <li key={i}>
            <span>{f}</span>
            <CheckCircle />
          </li>
        ))}
      </ul>

      <form className="sub-demo__form" onSubmit={handleSubmit}>
        <label className="sub-demo__field">
          <span className="sub-demo__field-tag">شماره همراه...</span>
          <input
            type="tel"
            dir="ltr"
            placeholder="۰۹..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        <label className="sub-demo__field">
          <span className="sub-demo__field-tag">توضیحات</span>
          <input
            type="text"
            dir="rtl"
            placeholder="نام مجموعه..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <button type="submit" className="sub-demo__submit">
          {submitted ? "ثبت شد ✓" : "درخواست دمو"}
        </button>
      </form>
    </section>
  );
}
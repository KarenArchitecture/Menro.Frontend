// src/components/subscriptions/SubscriptionsDemoBanner.jsx
import React, { useState } from "react";
import "../../assets/css/subscriptions-demo-banner.css";

const DEMO_FEATURES = [
  "امکان شماره ۵ با متن تقریبا طولانی",
  "امکان شماره ۹",
  "امکان شماره ۲",
  "امکان شماره ۱",
];

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
            <i className="fas fa-check-circle" aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <form className="sub-demo__form" onSubmit={handleSubmit}>
        <div className="sub-demo__field">
          <i
            className="fas fa-mobile-alt sub-demo__field-icon"
            aria-hidden="true"
          />
          <input
            type="tel"
            placeholder="شماره همراه..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="sub-demo__field sub-demo__field--tagged">
          <span className="sub-demo__field-tag">توضیحات</span>
          <input
            type="text"
            placeholder="نام مجموعه..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" className="sub-demo__submit">
          {submitted ? "ثبت شد ✓" : "درخواست دمو"}
        </button>
      </form>
    </section>
  );
}

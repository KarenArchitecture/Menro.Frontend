// src/components/subscriptions/SubscriptionsContactSection.jsx
import React, { useState } from "react";
import "../../assets/css/subscriptions/subscriptions-contact-section.css";

const DEFAULT_CITIES = ["تهران", "مشهد", "اصفهان", "شیراز", "تبریز", "کرج"];

export default function SubscriptionsContactSection({
  cities = DEFAULT_CITIES,
  phoneNumber = "۰۲۱ ۳۴۳۲ ۲۳۱۲",
  phoneHref = "tel:+982134322312",
  title = "سوالی دارید؟ با ما تماس بگیرید",
  subtitle = "مشاورین تیم منرو به صورت شبانه‌روز پاسخگوی سوالات شما عزیزان هستند",
}) {
  const [city, setCity] = useState(cities[0]);

  return (
    <section className="sub-contact">
      <div className="sub-contact__city">
        <label htmlFor="sub-contact-city">شهر خود را انتخاب کنید</label>
        <select
          id="sub-contact-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="sub-contact__info">
        <h3 className="sub-contact__title">{title}</h3>
        <p className="sub-contact__subtitle">{subtitle}</p>

        <a href={phoneHref} className="sub-contact__phone" dir="ltr">
          <i className="fas fa-phone-alt" aria-hidden="true" />
          {phoneNumber}
        </a>
      </div>
    </section>
  );
}

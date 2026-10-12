// src/components/subscriptions/SubscriptionsContactSection.jsx
import React, { useState } from "react";
import "../../assets/css/subscriptions/subscriptions-contact-section.css";

const DEFAULT_CITIES = ["تهران", "مشهد", "اصفهان", "شیراز", "تبریز", "کرج"];

export default function SubscriptionsContactSection({
  cities = DEFAULT_CITIES,
  phoneNumber = "+۲۱ ۳۴۳ ۲۳۱۲",
  phoneHref = "tel:+982134322312",
  titleLead = "سوالی دارید؟",
  titleAccent = "با ما تماس بگیرید",
  subtitle = "مشاورین تیم منرو به صورت شبانه روز پاسخگو سوالات شما عزیزان هستند",
  onCityChange,
}) {
  const [city, setCity] = useState(cities[0]);

  const handleCity = (e) => {
    setCity(e.target.value);
    if (onCityChange) onCityChange(e.target.value);
  };

  return (
    <section className="sub-contact" dir="rtl">
      {/* right side (RTL start): copy */}
      <div className="sub-contact__info">
        <h3 className="sub-contact__title">
          {titleLead} <span className="sub-contact__title-accent">{titleAccent}</span>
        </h3>
        <p className="sub-contact__subtitle">{subtitle}</p>
      </div>

      {/* left side: city select + phone */}
      <div className="sub-contact__actions">
        {/* decorative kashida in the label matches the Figma; aria-label keeps it clean */}
        <label className="sub-contact__label" htmlFor="sub-contact-city">
          شــهــر خــود را انــتــخــاب کــنــیــد
        </label>

        <select
          id="sub-contact-city"
          className="sub-contact__select"
          aria-label="شهر خود را انتخاب کنید"
          value={city}
          onChange={handleCity}
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <a href={phoneHref} className="sub-contact__phone" dir="ltr">
          <svg
            className="sub-contact__phone-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1L6.6 10.8Z"
            />
          </svg>
          <span className="sub-contact__phone-number">{phoneNumber}</span>
        </a>
      </div>
    </section>
  );
}
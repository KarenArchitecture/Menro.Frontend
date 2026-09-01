// src/components/subscriptions/SubscriptionsContactSection.jsx
import React, { useState } from "react";
import "../../assets/css/subscriptions-contact-section.css";

const DEFAULT_CITIES = ["تهران", "مشهد", "اصفهان", "شیراز", "تبریز", "کرج"];

export default function SubscriptionsContactSection({
  cities = DEFAULT_CITIES,
  phoneNumber = "+۲۱ ۳۴۳ ۲۳۱۲",
  phoneHref = "tel:+982134322312",
  titlePart1 = "سوالی دارید؟",
  titlePart2 = "با ما تماس بگیرید",
  subtitle = "مشاورین تیم منرو به صورت شبانه روز پاسخگو سوالات\nشما عزیزان هستند",
}) {
  const [city, setCity] = useState(cities[0]);

  return (
    <section className="sub-contact">
      <div className="sub-contact__wrapper">
        {/* Right side in RTL (Text) */}
        <div className="sub-contact__info">
          <h3 className="sub-contact__title">
            {titlePart1}{" "}
            <span className="sub-contact__title-highlight">{titlePart2}</span>
          </h3>
          <p className="sub-contact__subtitle">{subtitle}</p>
        </div>

        {/* Left side in RTL (Form/Actions) */}
        <div className="sub-contact__actions">
          <label htmlFor="sub-contact-city" className="sub-contact__label">
            شهر خود را انتخاب کنید
          </label>

          <div className="sub-contact__select-wrapper">
            <select
              id="sub-contact-city"
              className="sub-contact__select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {/* Custom SVG arrow positioned on the left side */}
            <svg
              className="sub-contact__select-arrow"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 9L12 16L5 9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <a href={phoneHref} className="sub-contact__phone">
            {/* FontAwesome Icon - rendering on the right in RTL */}
            <i className="fas fa-phone-alt" aria-hidden="true" />
            {/* Text forced LTR so the plus sign stays on the left */}
            <span dir="ltr">{phoneNumber}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

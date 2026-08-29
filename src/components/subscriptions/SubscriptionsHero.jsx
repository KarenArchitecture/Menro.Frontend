// src/components/subscriptions/SubscriptionsHero.jsx
import React from "react";
import "../../assets/css/subscriptions/subscriptions-hero.css";

export default function SubscriptionsHero({
  billingCycle = "yearly",
  onChangeBillingCycle = () => {},
  titlePrefix = "به‌صرفه‌ترین",
  titleRest = "قیمت‌های بازار",
  subtitle = "بهترین گزینه را برای مجموعه‌تان پیدا کنید",
  discountIconSrc = "/images/subscriptions/sub-plan-pointer.svg", // <- point this at your local file
}) {
  const isYearly = billingCycle === "yearly";

  return (
    <section className="sub-hero">
      <h1 className="sub-hero__title">
        <span className="sub-hero__title-highlight">{titlePrefix}</span>{" "}
        {titleRest}
      </h1>

      <p className="sub-hero__subtitle">{subtitle}</p>

      <div className="sub-hero__toggle-row">
        <div
          className={`sub-hero__toggle-labels ${
            isYearly ? "glow-yearly" : "glow-monthly"
          }`}
        >
          <span
            className={`sub-hero__toggle-label ${isYearly ? "" : "is-active"}`}
          >
            یک‌ماهه
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={isYearly}
            aria-label="تغییر دوره پرداخت"
            className={`sub-hero__switch ${isYearly ? "is-yearly" : "is-monthly"}`}
            onClick={() =>
              onChangeBillingCycle(isYearly ? "monthly" : "yearly")
            }
          >
            <span className="sub-hero__switch-thumb" />
          </button>

          <span
            className={`sub-hero__toggle-label ${isYearly ? "is-active" : ""}`}
          >
            یک‌ساله
          </span>
        </div>

        {/* placeholder svg — replace src/path later */}
        <div className="sub-hero__discount-hint">
          <img
            className="sub-hero__discount-arrow"
            src={discountIconSrc}
            alt=""
            aria-hidden="true"
          />
          <span className="sub-hero__discount-badge">۴۰٪ قیمت پایین‌تر</span>
        </div>
      </div>
    </section>
  );
}

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
        {/* option · switch · option — centered in the viewport, no wrapping box.
            Physical left→right order: یک‌ماهه | switch | یک‌ساله */}
        <div className="sub-hero__toggle">
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
            {/* decorative "lamps": the side the thumb sits on lights up */}
            <span
              className="sub-hero__switch-lit sub-hero__switch-lit--left"
              aria-hidden="true"
            />
            <span
              className="sub-hero__switch-lit sub-hero__switch-lit--right"
              aria-hidden="true"
            />
            <span className="sub-hero__switch-thumb" />
          </button>

          <span
            className={`sub-hero__toggle-label ${isYearly ? "is-active" : ""}`}
          >
            یک‌ساله
          </span>
        </div>

        {/* right-hand grid column: arrow points left at the options, slogan sits to its right */}
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
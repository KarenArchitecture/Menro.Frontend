// src/components/subscriptions/SubscriptionsComparisonTable.jsx
import React, { useState } from "react";
import "../../assets/css/subscriptions/subscriptions-comparison-table.css";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

// RTL layout: the FIRST item sits on the RIGHT (پایه is the right-most
// column in the design, سفارشی the left-most).
// `price` is in thousand-toman, per month. `null` = no price (contact us).
// NOTE: the yearly numbers match the Figma mock (199 / 259 / 549);
// the monthly numbers are placeholders — replace with real pricing.
const DEFAULT_PLANS = [
  {
    id: "basic",
    name: "پایه",
    price: { yearly: 199, monthly: 249 },
    cta: "انتخاب پلن",
  },
  {
    id: "advanced",
    name: "پیشرفته",
    price: { yearly: 259, monthly: 329 },
    cta: "انتخاب پلن",
  },
  {
    id: "pro",
    name: "حرفه‌ای",
    price: { yearly: 549, monthly: 689 },
    cta: "انتخاب پلن",
  },
  {
    id: "custom",
    name: "سفارشی",
    price: null,
    priceLabel: "تـمـاس بـگـیـریـد",
    cta: "تماس با ما",
  },
];

// `values` follow the order of DEFAULT_PLANS: basic, advanced, pro, custom.
const DEFAULT_CATEGORIES = [
  {
    id: "general-1",
    icon: "cube",
    title: "اطلاعات کلی",
    rows: [
      {
        label: "فضای ذخیره‌سازی موسیقی",
        values: ["10GB", "15GB", "20GB", "Custom"],
      },
      {
        label: "منو های کاستوم",
        values: ["کاستوم", "زیاد کاستوم", "خیلی کاستوم", "Custom"],
      },
      {
        label: "تایتل بسیار زیاد طولانی",
        values: ["کاستوم", "زیاد کاستوم", "خیلی کاستوم", "Custom"],
      },
    ],
  },
  {
    id: "general-2",
    icon: "chart",
    title: "کلی اطلاعات",
    rows: [
      {
        label: "فضای ذخیره‌سازی موسیقی",
        values: ["10GB", "15GB", "20GB", "Custom"],
      },
      {
        label: "منو های کاستوم",
        values: ["کاستوم", "زیاد کاستوم", "خیلی کاستوم", "Custom"],
      },
      {
        label: "تایتل بسیار زیاد طولانی",
        values: ["کاستوم", "زیاد کاستوم", "خیلی کاستوم", "Custom"],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const toFa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

const ICONS = {
  cube: (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3.5 27 9.6v12.8L16 28.5 5 22.4V9.6L16 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M5 9.6 16 15.8l11-6.2M16 15.8v12.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="m10.5 6.6 11 6.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M14 8.2A10.5 10.5 0 1 0 23.8 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M18 4.5a9.5 9.5 0 0 1 9.5 9.5H18V4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Billing switch                                                     */
/* ------------------------------------------------------------------ */

function BillingSwitch({ period, onChange }) {
  const yearly = period === "yearly";

  return (
    <div className="sub-switch">
      <button
        type="button"
        className={`sub-switch__label ${yearly ? "is-active" : ""}`}
        onClick={() => onChange("yearly")}
      >
        یک‌ساله
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={yearly}
        aria-label="تغییر دوره پرداخت: یک‌ساله / یک‌ماهه"
        className={`sub-switch__control ${yearly ? "is-up" : "is-down"}`}
        onClick={() => onChange(yearly ? "monthly" : "yearly")}
      >
        {/* faint lamp-like glow outside the borders */}
        <span className="sub-switch__halo sub-switch__halo--top" />
        <span className="sub-switch__halo sub-switch__halo--bottom" />

        <span className="sub-switch__body">
          {/* neon border: bright at the edge, fades out at the middle */}
          <span className="sub-switch__ring sub-switch__ring--top" />
          <span className="sub-switch__ring sub-switch__ring--bottom" />
          <span className="sub-switch__knob" />
        </span>
      </button>

      <button
        type="button"
        className={`sub-switch__label ${!yearly ? "is-active" : ""}`}
        onClick={() => onChange("monthly")}
      >
        یک‌ماهه
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SubscriptionsComparisonTable({
  plans = DEFAULT_PLANS,
  categories = DEFAULT_CATEGORIES,
  defaultPeriod = "yearly",
  onPeriodChange,
}) {
  const [period, setPeriod] = useState(defaultPeriod);

  const handlePeriod = (next) => {
    setPeriod(next);
    if (onPeriodChange) onPeriodChange(next);
  };

  const colStyle = { "--sub-cols": plans.length };

  return (
    <section className="sub-compare" dir="rtl" style={colStyle}>
      <div className="sub-compare__scroll">
        <div className="sub-compare__inner">
          {/* ---------- switch + plan selection box ---------- */}
          <div className="sub-compare__top">
            <div className="sub-compare__top-side">
              <BillingSwitch period={period} onChange={handlePeriod} />
            </div>

            <div className="sub-plans">
              {plans.map((plan) => (
                <div key={plan.id} className="sub-plans__col">
                  <h3 className="sub-plans__name">{plan.name}</h3>

                  <p className="sub-plans__price">
                    {plan.price ? (
                      <>
                        <span
                          key={period}
                          className="sub-plans__amount"
                        >
                          {toFa(plan.price[period])} هزار تومن
                        </span>
                        <span className="sub-plans__per"> / ماه</span>
                      </>
                    ) : (
                      <span className="sub-plans__amount">
                        {plan.priceLabel}
                      </span>
                    )}
                  </p>

                  <button type="button" className="sub-plans__cta">
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- comparison table ---------- */}
          <div className="sub-table">
            {categories.map((cat) => (
              <div key={cat.id} className="sub-table__category">
                <div className="sub-table__title">
                  <span className="sub-table__title-icon">
                    {ICONS[cat.icon]}
                  </span>
                  <span className="sub-table__title-text">{cat.title}</span>
                </div>

                {cat.rows.map((row, i) => (
                  <div key={i} className="sub-table__row">
                    <div className="sub-table__label">{row.label}</div>
                    <div className="sub-table__values">
                      {row.values.map((v, j) => (
                        <div key={j} className="sub-table__value">
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
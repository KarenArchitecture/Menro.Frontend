// src/components/subscriptions/SubscriptionsComparisonTable.jsx
import React, { useState } from "react";
import "../../assets/css/subscriptions-comparison-table.css";

const DEFAULT_PLANS = [
  {
    id: "basic",
    name: "پایه",
    price: "۱۹۹ هزار تومان / ماه",
    cta: "انتخاب پلن",
  },
  {
    id: "advanced",
    name: "پیشرفته",
    price: "۲۵۹ هزار تومان / ماه",
    cta: "انتخاب پلن",
  },
  {
    id: "pro",
    name: "حرفه‌ای",
    price: "۵۴۹ هزار تومان / ماه",
    cta: "انتخاب پلن",
  },
  { id: "custom", name: "سفارشی", price: "تماس بگیرید", cta: "تماس با ما" },
];

const DEFAULT_CATEGORIES = [
  {
    id: "general-1",
    iconSrc: "/images/subscriptions/icons/category-general.svg",
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
    iconSrc: "/images/subscriptions/icons/category-details.svg",
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
  {
    id: "general-3",
    iconSrc: "/images/subscriptions/icons/category-features.svg",
    title: "ویژگی‌های پیشرفته",
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
    id: "general-4",
    iconSrc: "/images/subscriptions/icons/category-support.svg",
    title: "پشتیبانی و خدمات",
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

export default function SubscriptionsComparisonTable({
  plans = DEFAULT_PLANS,
  categories = DEFAULT_CATEGORIES,
}) {
  const [isAnnual, setIsAnnual] = useState(true);

  const gridStyle = {
    gridTemplateColumns: `1.4fr repeat(5, minmax(110px, 1fr))`,
  };

  return (
    <section className="sub-compare">
      {/* Container wrapper ensures 100% full-bleed background while constraining content max-width */}
      <div className="sub-compare__container">
        <div className="sub-compare__scroll">
          <div className="sub-compare__table">
            {/* Header Grid */}
            <div className="sub-compare__header" style={gridStyle}>
              {/* Vertical Toggle Switch */}
              <div className="sub-compare__toggle-cell">
                <span
                  className={`sub-compare__toggle-label ${
                    isAnnual ? "is-active" : ""
                  }`}
                >
                  یک‌ساله
                </span>
                <button
                  type="button"
                  className={`sub-compare__toggle-switch ${
                    isAnnual ? "is-annual" : "is-monthly"
                  }`}
                  onClick={() => setIsAnnual(!isAnnual)}
                  aria-label="تغییر دوره پرداخت"
                >
                  <span className="sub-compare__toggle-thumb" />
                </button>
                <span
                  className={`sub-compare__toggle-label ${
                    !isAnnual ? "is-active" : ""
                  }`}
                >
                  یک‌ماهه
                </span>
              </div>

              {/* Unified Floating Plan Cards Container */}
              <div className="sub-compare__plans-card">
                {plans.map((plan) => (
                  <div key={plan.id} className="sub-compare__header-cell">
                    <span className="sub-compare__plan-name">{plan.name}</span>
                    <span className="sub-compare__plan-price">
                      {plan.price}
                    </span>
                    <button type="button" className="sub-compare__plan-cta">
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Categories & Data Rows */}
            {categories.map((cat) => (
              <div key={cat.id} className="sub-compare__category">
                <div className="sub-compare__category-title" style={gridStyle}>
                  <div className="sub-compare__category-title-inner">
                    <img
                      src={cat.iconSrc}
                      alt=""
                      className="sub-compare__category-icon"
                    />
                    <span>{cat.title}</span>
                  </div>
                </div>

                {cat.rows.map((row, i) => (
                  <div key={i} className="sub-compare__row" style={gridStyle}>
                    <div className="sub-compare__row-label">{row.label}</div>
                    {row.values.map((val, j) => (
                      <div key={j} className="sub-compare__row-value">
                        {val}
                      </div>
                    ))}
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

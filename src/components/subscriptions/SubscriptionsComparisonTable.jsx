// src/components/subscriptions/SubscriptionsComparisonTable.jsx
import React from "react";
import "../../assets/css/subscriptions/subscriptions-comparison-table.css";

const DEFAULT_PLANS = [
  { id: "custom", name: "سفارشی", cta: "تماس بگیرید", theme: "neutral" },
  { id: "pro", name: "حرفه‌ای", cta: "انتخاب پلن", theme: "green" },
  {
    id: "advanced",
    name: "پیشرفته",
    cta: "انتخاب پلن",
    theme: "purple",
    popular: true,
  },
  { id: "basic", name: "پایه", cta: "انتخاب پلن", theme: "orange" },
];

// Placeholder comparison data — mirrors the design mock, which repeats the
// same dummy rows under two category headers as a stand-in for real
// content. Add/replace categories here; `values` must be in the same
// order as DEFAULT_PLANS (custom, pro, advanced, basic).
const DEFAULT_CATEGORIES = [
  {
    id: "general-1",
    icon: "fas fa-box",
    title: "اطلاعات کلی",
    rows: [
      {
        label: "فضای ذخیره‌سازی موسیقی",
        values: ["Custom", "20GB", "15GB", "10GB"],
      },
      {
        label: "منو های کاستوم",
        values: ["Custom", "خیلی کاستوم", "زیاد کاستوم", "کاستوم"],
      },
      {
        label: "تایتل بسیار زیاد طولانی",
        values: ["Custom", "خیلی کاستوم", "زیاد کاستوم", "کاستوم"],
      },
    ],
  },
  {
    id: "general-2",
    icon: "fas fa-layer-group",
    title: "کلی اطلاعات",
    rows: [
      {
        label: "فضای ذخیره‌سازی موسیقی",
        values: ["Custom", "20GB", "15GB", "10GB"],
      },
      {
        label: "منو های کاستوم",
        values: ["Custom", "خیلی کاستوم", "زیاد کاستوم", "کاستوم"],
      },
      {
        label: "تایتل بسیار زیاد طولانی",
        values: ["Custom", "خیلی کاستوم", "زیاد کاستوم", "کاستوم"],
      },
    ],
  },
];

export default function SubscriptionsComparisonTable({
  plans = DEFAULT_PLANS,
  categories = DEFAULT_CATEGORIES,
}) {
  const gridStyle = {
    gridTemplateColumns: `1.4fr repeat(${plans.length}, minmax(110px, 1fr))`,
  };

  return (
    <section className="sub-compare">
      <div className="sub-compare__scroll">
        <div className="sub-compare__table">
          <div className="sub-compare__header" style={gridStyle}>
            <div className="sub-compare__header-label" />
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`sub-compare__header-cell sub-compare__header-cell--${plan.theme} ${
                  plan.popular ? "is-popular" : ""
                }`}
              >
                <span className="sub-compare__plan-name">{plan.name}</span>
                <button type="button" className="sub-compare__plan-cta">
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {categories.map((cat) => (
            <div key={cat.id} className="sub-compare__category">
              <div className="sub-compare__category-title" style={gridStyle}>
                <div className="sub-compare__category-title-inner">
                  <i className={cat.icon} aria-hidden="true" />
                  <span>{cat.title}</span>
                </div>
              </div>

              {cat.rows.map((row, i) => (
                <div key={i} className="sub-compare__row" style={gridStyle}>
                  <div className="sub-compare__row-label">{row.label}</div>
                  {row.values.map((v, j) => (
                    <div key={j} className="sub-compare__row-value">
                      {v}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

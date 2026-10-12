// src/components/subscriptions/SubscriptionsPricingCards.jsx
import React, { useState } from "react";
import "../../assets/css/subscriptions/subscriptions-pricing-cards.css";

// Same line-mesh used by InstallPhonesBanner (rotated in CSS for tall cards).
const MESH_SRC = "/images/common/blog-hero-pattern.png";

const DEFAULT_PLANS = [
  {
    id: "pro",
    theme: "green",
    name: "حرفه‌ای",
    subtitle: "شروعی قدرتمند برای رستوران‌هایی که به فکر آینده‌اند",
    monthlyPrice: 549,
    ctaLabel: "شروع حرفه‌ای",
    scrollFeatures: true,
    features: [
      "امکان شماره ۱",
      "امکان شماره ۲",
      "امکان شماره ۳",
      "امکان شماره ۴ با متن نسبتا طولانی",
      "امکان شماره ۵ با متن نسبتا طولانی",
      "امکان شماره ۶",
      "امکان شماره ۷",
      "امکان شماره ۸",
      "امکان شماره ۹",
    ],
  },
  {
    id: "advanced",
    theme: "purple",
    name: "پیشرفته",
    subtitle: "شروعی قدرتمند برای رستوران‌هایی که به فکر آینده‌اند",
    monthlyPrice: 259,
    popular: true,
    ctaLabel: "شروع با امکانات",
    scrollFeatures: true,
    features: [
      "امکان شماره ۱",
      "امکان شماره ۲",
      "امکان شماره ۳",
      "امکان شماره ۴ با متن نسبتا طولانی",
      "امکان شماره ۵ با متن نسبتا طولانی",
      "امکان شماره ۶",
      "امکان شماره ۷",
      "امکان شماره ۸",
      "امکان شماره ۹",
      "امکان شماره ۱۰ با متن طولانی",
    ],
  },
  {
    id: "basic",
    theme: "orange",
    name: "پایه",
    subtitle: "شروعی قدرتمند برای رستوران‌هایی که به فکر آینده‌اند",
    monthlyPrice: 199,
    ctaLabel: "شروع کار",
    scrollFeatures: false,
    features: [
      "امکان شماره ۱",
      "امکان شماره ۲",
      "امکان شماره ۳",
      "امکان شماره ۴ با متن نسبتا طولانی",
      "امکان شماره ۵ با متن نسبتا طولانی",
    ],
  },
];

function getDisplayPrice(monthlyPrice, billingCycle) {
  return billingCycle === "yearly"
    ? Math.round(monthlyPrice * 0.6)
    : monthlyPrice;
}

function FeatureItem({ feature }) {
  return (
    <li>
      <i className="fas fa-check-circle" aria-hidden="true" />
      <span>{feature}</span>
    </li>
  );
}

export default function SubscriptionsPricingCards({
  billingCycle = "yearly",
  plans = DEFAULT_PLANS,
  selectedPlanId,
  bgSrc = MESH_SRC, // default mesh for every card; a plan can override with plan.bgImage
}) {
  const [selectedId, setSelectedId] = useState(
    selectedPlanId ?? plans.find((p) => p.popular)?.id,
  );

  return (
    <section className="sub-pricing-cards">
      {plans.map((plan) => {
        const price = getDisplayPrice(plan.monthlyPrice, billingCycle);
        const shouldScroll = Boolean(plan.scrollFeatures);
        const scrollDuration = `${(plan.features.length * 1.6).toFixed(1)}s`;
        const isSelected = plan.id === selectedId;

        return (
          <div
            key={plan.id}
            className={[
              "sub-plan-card",
              `sub-plan-card--${plan.theme}`,
              plan.popular && "sub-plan-card--popular",
              isSelected && "sub-plan-card--selected",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSelectedId(plan.id)}
          >
            <img
              className="sub-plan-card__mesh"
              src={plan.bgImage ?? bgSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />

            <h3 className="sub-plan-card__name">{plan.name}</h3>

            <div className="sub-plan-card__price">
              <span className="sub-plan-card__price-value">
                {price.toLocaleString("fa-IR")} هزار تومان
              </span>
              <span className="sub-plan-card__price-unit">/ ماه</span>
            </div>

            {plan.subtitle && (
              <p className="sub-plan-card__subtitle">{plan.subtitle}</p>
            )}

            <div className="sub-plan-card__features-viewport">
              <ul
                className={`sub-plan-card__features ${
                  shouldScroll ? "is-scrolling" : ""
                }`}
                style={
                  shouldScroll
                    ? { "--scroll-duration": scrollDuration }
                    : undefined
                }
              >
                {plan.features.map((feature, i) => (
                  <FeatureItem key={i} feature={feature} />
                ))}
                {shouldScroll &&
                  plan.features.map((feature, i) => (
                    <FeatureItem key={`dup-${i}`} feature={feature} />
                  ))}
              </ul>
            </div>

            <button type="button" className="sub-plan-card__cta">
              {plan.ctaLabel}
            </button>
          </div>
        );
      })}
    </section>
  );
}
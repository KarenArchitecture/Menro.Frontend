// src/components/subscriptions/SubscriptionsPricingCards.jsx
import React from "react";
import "../../assets/css/subscriptions-pricing-cards.css";

// NOTE: placeholder plan data mirroring the design mock. Swap numbers /
// feature copy / bgImage for real content whenever it's ready.
// `scrollFeatures: true` marks plans whose feature list is long enough to
// exceed the card's fixed height — those get the auto-scrolling marquee.
const DEFAULT_PLANS = [
  {
    id: "pro",
    theme: "green",
    name: "حرفه‌ای",
    monthlyPrice: 549,
    bgImage: "/assets/images/plan-bg-green.png",
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
    bgImage: "/assets/images/plan-bg-purple.png",
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
    bgImage: "/assets/images/plan-bg-orange.png",
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

// Placeholder math: yearly billing shows ~40% off the monthly price,
// matching the badge in SubscriptionsHero. Replace with real pricing logic
// once it's available.
function getDisplayPrice(monthlyPrice, billingCycle) {
  return billingCycle === "yearly"
    ? Math.round(monthlyPrice * 0.6)
    : monthlyPrice;
}

function FeatureItem({ feature, index }) {
  return (
    <li key={index}>
      <i className="fas fa-check-circle" aria-hidden="true" />
      <span>{feature}</span>
    </li>
  );
}

export default function SubscriptionsPricingCards({
  billingCycle = "yearly",
  plans = DEFAULT_PLANS,
}) {
  return (
    <section className="sub-plans">
      {plans.map((plan) => {
        const price = getDisplayPrice(plan.monthlyPrice, billingCycle);
        const shouldScroll = Boolean(plan.scrollFeatures);

        // rough pacing: ~1.6s per feature line, duplicated list scrolls
        // through exactly one copy (-50%) before looping seamlessly
        const scrollDuration = `${(plan.features.length * 1.6).toFixed(1)}s`;

        return (
          <div
            key={plan.id}
            className={`sub-plan-card sub-plan-card--${plan.theme} ${
              plan.popular ? "sub-plan-card--popular" : ""
            }`}
            style={{ "--sub-card-bg": `url(${plan.bgImage})` }}
          >
            <h3 className="sub-plan-card__name">{plan.name}</h3>

            <div className="sub-plan-card__price">
              <span className="sub-plan-card__price-value">
                {price.toLocaleString("fa-IR")}
              </span>
              <span className="sub-plan-card__price-unit">
                هزار تومان / ماه
              </span>
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
                  <FeatureItem key={i} feature={feature} index={i} />
                ))}
                {/* duplicate set — only rendered when scrolling, makes the loop seamless */}
                {shouldScroll &&
                  plan.features.map((feature, i) => (
                    <FeatureItem key={`dup-${i}`} feature={feature} index={i} />
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

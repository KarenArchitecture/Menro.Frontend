// src/pages/SubscriptionsPage.jsx
import React, { useState } from "react";

import AppHeader from "../components/common/AppHeader";
import GlassFooter from "../components/common/GlassFooter";
import FooterFruitsScene from "../components/common/FooterFruitsScene";

import SubscriptionsHero from "../components/subscriptions/SubscriptionsHero";
import SubscriptionsPricingCards from "../components/subscriptions/SubscriptionsPricingCards";
import SubscriptionsDemoBanner from "../components/subscriptions/SubscriptionsDemoBanner";
import SubscriptionsTrustedBrands from "../components/subscriptions/SubscriptionsTrustedBrands";
import SubscriptionsComparisonTable from "../components/subscriptions/SubscriptionsComparisonTable";
import SubscriptionsContactSection from "../components/subscriptions/SubscriptionsContactSection";

import "../assets/css/styles-subscriptions.css";

const leftIcons = [
  {
    key: "profile",
    icon: (
      <img
        src="/images/app-header-profile.svg"
        alt="profile"
        className="icon"
      />
    ),
  },
  {
    key: "cart",
    icon: <img src="/images/app-header-bag.svg" alt="cart" className="icon" />,
  },
  {
    key: "search",
    icon: (
      <img src="/images/app-header-search.svg" alt="search" className="icon" />
    ),
  },
];

export default function SubscriptionsPage() {
  // Shared between the hero toggle and the pricing cards below it.
  const [billingCycle, setBillingCycle] = useState("yearly");

  return (
    <div className="subscription-page" dir="rtl">
      <div className="subscription-page__header-wrapper">
        <AppHeader
          leftIcons={leftIcons}
          position="fixed"
          top={12}
          maxWidth={1140}
        />
      </div>

      <div className="subscription-page__spacer" />

      <SubscriptionsHero
        billingCycle={billingCycle}
        onChangeBillingCycle={setBillingCycle}
      />

      <SubscriptionsPricingCards billingCycle={billingCycle} />

      <SubscriptionsDemoBanner />

      <SubscriptionsTrustedBrands />

      <SubscriptionsComparisonTable />

      <SubscriptionsContactSection />

      <section className="footer-bg subscription-page__footer">
        <FooterFruitsScene />
        <div className="footer-bg__content">
          <GlassFooter />
        </div>
      </section>
    </div>
  );
}

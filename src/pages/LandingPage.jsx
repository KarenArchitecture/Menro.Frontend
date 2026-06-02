import React, { useEffect } from "react";
import usePageStyles from "../hooks/usePageStyles";

import Hero from "../components/landing/Hero";
import AppHeader from "../components/common/AppHeader";

import StatsSection from "../components/landing/StatsSection";
import WhyMenroSection from "../components/landing/WhyMenroSection";
import InstallPhonesBanner from "../components/landing/InstallPhonesBanner";
import PlansSection from "../components/landing/PlansSection";
import BurgerPanelSection from "../components/landing/BurgerPanelSection";
import FAQSection from "../components/landing/FAQSection";
import BlogSection from "../components/landing/BlogSection";
import GlassFooter from "../components/common/GlassFooter";
import FooterFruitsScene from "../components/common/FooterFruitsScene";
import MobileHeader from "../components/common/MobileHeader";

export default function LandingPage() {
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
      icon: (
        <img src="/images/app-header-bag.svg" alt="cart" className="icon" />
      ),
      badge: 1,
    },
    {
      key: "search",
      icon: (
        <img
          src="/images/app-header-search.svg"
          alt="search"
          className="icon"
        />
      ),
    },
  ];

  // ✅ NEW: usePageStyles now returns "ready"
  const stylesReady = usePageStyles("/styles-landing.css");

  // ✅ After styles load, force a layout re-measure for scroll/pin animations
  useEffect(() => {
    if (!stylesReady) return;
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }, [stylesReady]);

  // ✅ Prevent FOUC + wrong initial measurements
  if (!stylesReady) {
    return <div dir="rtl" style={{ minHeight: "100dvh" }} />;
  }

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", overflowX: "hidden" }}>
      <AppHeader
        leftIcons={leftIcons}
        position="fixed"
        top={12}
        maxWidth={1140}
        className="landing-desktop-header"
      />

      <MobileHeader />

      <Hero />
      <WhyMenroSection />
      <StatsSection />

      <InstallPhonesBanner
        bgSrc="/images/phone-background.png"
        phoneFrontSrc="/images/phone-right.png"
        phoneBackSrc="/images/phone-left.png"
      >
        <h2 className="hero__title">نرم‌افزار و پنل پیشرفته منرو</h2>
        <h3 className="hero__description">همین حالا نصب کنید</h3>
      </InstallPhonesBanner>

      <PlansSection
        meshCardSrc="/images/phone-background.png"
        checkIconSrc="/images/icons/check-circle.svg"
      />

      <BurgerPanelSection
        title="با منرو تو چشم باش"
        burgerSrc="/images/burger-landing.png"
      />

      <FAQSection />
      <BlogSection />

      <section className="footer-bg">
        <FooterFruitsScene />
        <div className="footer-bg__content">
          <GlassFooter />
        </div>
      </section>
    </div>
  );
}

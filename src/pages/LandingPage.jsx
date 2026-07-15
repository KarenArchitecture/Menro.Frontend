import React, { useEffect, useState } from "react";
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

// Adjust this path to wherever the api/ folder lives in the project
// (mirrors the blogAxios.js / blogs.js pattern for the public blog API).
import {
  getLandingGeneral,
  getLandingReasons,
  getLandingFaqs,
} from "../api/landing";

// Fallback used until getLandingGeneral() resolves, or if it fails —
// matches the previously hardcoded BurgerPanelSection title.
const DEFAULT_BURGER_TITLE = "با منرو تو چشم باش";

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

  // Landing content from the public API. `general` stays `null` until
  // loaded; `generalStatus` tells Hero specifically when the /general fetch
  // has settled (success or failure) so it can pick its final image exactly
  // once instead of flashing the fallback first.
  const [general, setGeneral] = useState(null);
  const [generalStatus, setGeneralStatus] = useState("loading"); // "loading" | "loaded" | "error"
  const [reasons, setReasons] = useState(null);
  const [faqs, setFaqs] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLandingContent() {
      try {
        const [generalData, reasonsData, faqsData] = await Promise.all([
          getLandingGeneral(),
          getLandingReasons(),
          getLandingFaqs(),
        ]);

        if (cancelled) return;

        setGeneral(generalData);
        setGeneralStatus("loaded");
        setReasons(reasonsData);
        setFaqs(faqsData);
      } catch (err) {
        if (cancelled) return;

        // صفحه همچنان با محتوای پیش‌فرض کامپوننت‌ها قابل نمایش است
        console.error("خطا در دریافت اطلاعات صفحه لندینگ:", err);
        setGeneralStatus("error");
      }
    }

    loadLandingContent();

    return () => {
      cancelled = true;
    };
  }, []);

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

      <Hero
        heroImageUrl={general?.heroImageUrl}
        titleHighlight={general?.heroTitleHighlight}
        titleText={general?.heroTitleText}
        isLoading={generalStatus === "loading"}
      />
      <WhyMenroSection reasons={reasons} />
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
        title={general?.burgerPanelTitle ?? DEFAULT_BURGER_TITLE}
        burgerSrc="/images/burger-landing.png"
      />

      <FAQSection items={faqs ?? undefined} />
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

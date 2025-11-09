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

  usePageStyles("/styles-landing.css");
  return (
    <div dir="rtl">
      <AppHeader
        leftIcons={leftIcons}
        position="fixed"
        top={12}
        maxWidth={1140}
      />
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

      <section
        className="footer-bg"
        style={{
          backgroundImage: "url('/images/landing-footer-fruits.png')",
        }}
      >
        <GlassFooter />
      </section>
    </div>
  );
}

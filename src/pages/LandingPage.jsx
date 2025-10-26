import usePageStyles from "../hooks/usePageStyles";

import Hero from "../components/landing/Hero";
import AppHeader from "../components/common/AppHeader";
import ProfileIcon from "../components/icons/ProfileIcon";
import CartIcon from "../components/icons/CartIcon";
import SearchIcon from "../components/icons/SearchIcon";

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
    { key: "profile", icon: <ProfileIcon /> },
    { key: "cart", icon: <CartIcon />, badge: 1 },
    { key: "search", icon: <SearchIcon /> },
  ];
  const rightLinks = [
    { label: "منرو", href: "#", active: true },
    { label: "خانه", href: "#" },
    { label: "نقشه", href: "#" },
    { label: "مقالات", href: "#" },
  ];

  usePageStyles("/styles-landing.css");
  return (
    <div dir="rtl">
      <AppHeader
        rightLinks={rightLinks}
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
        {/* (optional) If you want real text over the card later, drop it here) */}
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

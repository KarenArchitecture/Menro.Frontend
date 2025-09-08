import usePageStyles from "../hooks/usePageStyles";

import Hero from "../components/landing/Hero";
import AppHeader from "../components/common/AppHeader";
import ProfileIcon from "../components/icons/ProfileIcon";
import CartIcon from "../components/icons/CartIcon";
import SearchIcon from "../components/icons/SearchIcon";

import StatsSection from "../components/landing/StatsSection";
import WhyMenroSection from "../components/landing/WhyMenroSection";

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
    </div>
  );
}

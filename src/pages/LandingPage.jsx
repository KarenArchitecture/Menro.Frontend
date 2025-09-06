import usePageStyles from "../hooks/usePageStyles";
import Hero from "../components/landing/Hero";

import AppHeader from "../components/common/AppHeader";

export default function LandingPage() {
  usePageStyles("/styles-landing.css");
  return (
    <div dir="rtl">
      <AppHeader />
      <Hero />
    </div>
  );
}

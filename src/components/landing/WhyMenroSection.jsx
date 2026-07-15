// src/components/landing/WhyMenroSection.jsx
import React, { useRef, useLayoutEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import IconCard from "./IconCard";
import InfoCard from "./InfoCard";
import SalesBoostCard from "./SalesBoostCard";
import CostReductionCard from "./CostReductionCard";
import LandingDiamondIcon from "../icons/LandingDiamondIcon";
import LandingCubeIcon from "../icons/LandingCubeIcon";
import LandingRankIcon from "../icons/LandingRankIcon";
import LandingRadarIcon from "../icons/LandingRadarIcon";
import LandingPcIcon from "../icons/LandingPcIcon";
import LandingWalletIcon from "../icons/LandingWalletIcon";

gsap.registerPlugin(ScrollTrigger);

const REASON_ICON_MAP = {
  diamond: LandingDiamondIcon,
  cube: LandingCubeIcon,
  rank: LandingRankIcon,
  radar: LandingRadarIcon,
  pc: LandingPcIcon,
  wallet: LandingWalletIcon,
};

const DEFAULT_TEXT =
  "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه لورم ایپسوم متن ساختگی";

// Matches the site's accent orange already used elsewhere (e.g. .hero__title
// span { color: #ff683c; } in hero.css) — used when the API doesn't supply
// a ColorHex.
const DEFAULT_ACCENT_COLOR = "#ff683c";

// LandingReasonResponse.Icon is a Font Awesome class string (e.g.
// "fa-solid fa-cube"), and ColorHex is its color. Font Awesome must be
// loaded globally for these classes to render anything — if you're seeing
// blank space where an icon should be (no glyph, no fallback box), Font
// Awesome likely isn't imported yet. Either add the CDN kit script to
// index.html, or run `npm install @fortawesome/fontawesome-free` and add
// `import "@fortawesome/fontawesome-free/css/all.min.css";` once near your
// app's entry point (e.g. main.jsx) — importing it per-component would load
// it repeatedly.
function ReasonIcon({ iconClass, colorHex, FallbackComp }) {
  const color = colorHex || DEFAULT_ACCENT_COLOR;

  if (iconClass) {
    return <i className={iconClass} style={{ color }} aria-hidden="true" />;
  }

  // Fallback to the original bundled SVG icon when the API doesn't provide
  // an icon class (missing/empty Icon field).
  return (
    <span style={{ color }}>
      <FallbackComp />
    </span>
  );
}

// The layout (pos-a .. pos-i) is a fixed CSS grid. SalesBoostCard (pos-a),
// CostReductionCard (pos-h) and the logo card (pos-i) are specialized,
// non-editable UI (charts / brand mark), so they stay static — per the
// LandingController comment, only simple text+icon "reason" content is
// backed by the API. The remaining 6 slots below are filled, in order, from
// getLandingReasons(). If fewer than 6 reasons come back, the missing slots
// fall back to their original placeholder content.
const REASON_SLOTS = [
  {
    key: "b",
    className: "why-card pos-b",
    type: "info",
    defaultIcon: "diamond",
  },
  {
    key: "c",
    className: "why-card pos-c",
    type: "info",
    defaultIcon: "cube",
  },
  {
    key: "d",
    className: "why-card pos-d",
    type: "info",
    defaultIcon: "rank",
  },
  {
    key: "e",
    className: "why-card why-card--tag pos-e",
    type: "info",
    defaultIcon: "radar",
  },
  {
    key: "f",
    className: "why-card why-card--small pos-f",
    type: "icon",
    defaultIcon: "pc",
    defaultTitle: "پنل اختصاصی",
  },
  {
    key: "g",
    className: "why-card why-card--panel pos-g",
    type: "icon",
    defaultIcon: "wallet",
    defaultTitle: "مدیریت مالی",
  },
];

export default function WhyMenroSection({ reasons = null }) {
  const sectionRef = useRef(null);
  const titlesRef = useRef(null);

  const cards = useMemo(
    () =>
      REASON_SLOTS.map((slot, idx) => {
        const data = reasons?.[idx];
        const FallbackComp = REASON_ICON_MAP[slot.defaultIcon];
        const title = data?.title ?? slot.defaultTitle ?? "عنوان دلیل";
        const description = data?.description ?? DEFAULT_TEXT;

        return {
          // Stable per-slot key — must NOT change once `reasons` loads.
          // GSAP's ScrollTrigger (set up once in the useLayoutEffect below)
          // attaches scroll-driven transforms directly to these DOM nodes.
          // If the key changed (e.g. to the API's data.id), React would
          // unmount/remount a brand new element the moment real data
          // arrives, losing those transforms entirely — which is what was
          // causing cards to lose their scroll position and overlap.
          key: slot.key,
          className: slot.className,
          type: slot.type,
          icon: (
            <ReasonIcon
              iconClass={data?.icon}
              colorHex={data?.colorHex}
              FallbackComp={FallbackComp}
            />
          ),
          title,
          description,
        };
      }),
    [reasons],
  );

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Only abort if the user prefers reduced motion.
    // We removed the isMobile check here so GSAP matchMedia can handle it.
    if (reducedMotion.matches) return;

    const section = sectionRef.current;
    const titles = titlesRef.current;

    if (!section || !titles) return;

    // Use gsap.matchMedia() to manage responsive animations and cleanup
    const mm = gsap.matchMedia();

    // -------------------------
    // DESKTOP ANIMATIONS (>= 769px)
    // -------------------------
    mm.add("(min-width: 769px)", () => {
      const cardEls = gsap.utils.toArray(".why-card");

      // Original Desktop Title Animation
      gsap.fromTo(
        titles,
        {
          xPercent: -50,
          yPercent: 70,
        },
        {
          xPercent: -50,
          yPercent: -270,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      // Original Desktop Cards Animation
      gsap.to(cardEls, {
        yPercent: -200,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    // -------------------------
    // MOBILE ANIMATIONS (<= 768px)
    // -------------------------
    // Mobile Animations (max-width: 768px)
    mm.add("(max-width: 768px)", () => {
      // 1. Create a timeline and attach the ScrollTrigger to it
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          scroller: ".app-shell__content",
          start: "top 50%",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      // 2. Move down continuously for the whole scroll duration
      tl.to(
        titlesRef.current,
        {
          y: "140vh",
          ease: "none", // Keeps the speed consistent
          duration: 1, // Represents 100% of the scroll distance
        },
        0,
      ) // The '0' means start exactly at the beginning

        // 3. Fade out ONLY at the end
        .to(
          titlesRef.current,
          {
            opacity: 0,
            ease: "none",
            duration: 0.3, // Takes up 30% of the scroll distance
          },
          0.7,
        ); // The '0.7' means wait until the scroll is 70% complete before starting the fade
    });

    // Cleanup all matchMedia animations when the component unmounts
    return () => mm.revert();
  }, []);

  return (
    <section className="why-static" id="why-menro" ref={sectionRef}>
      {/* Fixed center title */}
      <div className="why-static__titles" ref={titlesRef}>
        <h2 className="why-static__title">چرا منرو؟</h2>
        <p className="why-static__subtitle">هر لحظه همراه تو</p>
      </div>

      {/* Cards */}
      <SalesBoostCard className="why-card pos-a" />

      {cards.slice(0, 2).map((card) => (
        <InfoCard
          key={card.key}
          className={card.className}
          icon={card.icon}
          title={card.title}
        >
          {card.description}
        </InfoCard>
      ))}

      <CostReductionCard className="why-card why-card--chart pos-h" />

      {cards.slice(2, 4).map((card) => (
        <InfoCard
          key={card.key}
          className={card.className}
          icon={card.icon}
          title={card.title}
        >
          {card.description}
        </InfoCard>
      ))}

      {cards.slice(4, 6).map((card) => (
        <IconCard
          key={card.key}
          className={card.className}
          icon={card.icon}
          title={card.title}
        />
      ))}

      <IconCard
        className="why-card why-card--panel pos-i pos-i--menro-logo"
        icon={
          <img
            src="/images/menro-logo-landing.svg"
            alt="منرو"
            className="why-menro-logo-icon"
            draggable="false"
          />
        }
      />
    </section>
  );
}

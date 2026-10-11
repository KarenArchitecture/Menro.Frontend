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
import useScroller from "./UseScroller";

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

// Matches the site's accent orange already used elsewhere — used when the API
// doesn't supply a ColorHex.
const DEFAULT_ACCENT_COLOR = "#ff683c";

// Font Awesome glyphs scale with font-size, not their container, so this
// brings API-driven icons up to the same size as the fallback SVG icons.
// (Font Awesome must be loaded globally for the API icon classes to render.)
const REASON_ICON_FONT_SIZE = "1.8rem";

/* ------------------------------------------------------------------ */
/* Desktop parallax: one row per card. Tune the numbers here.          */
/* ------------------------------------------------------------------ */
//
// Each card moves UP by an extra `travel` (in viewport heights) on top of the
// normal page scroll, so it looks like it is rising on its own.
//
//   travel : how far it rises. Bigger = looks closer to the user, moves faster.
//   from/to: WHEN it moves, as a fraction of the section's scroll
//            (0 = section enters the screen, 1 = section has left).
//            A later `from` makes a card hold back, then catch up.
//   ease   : shape of the motion. "power2.inOut" drifts, speeds up, then eases
//            out. "power1.out" starts quick and settles. "none" is constant.
//
// Keep cards that sit near each other at similar `travel` values, otherwise
// they will run into each other on the way up.
const CARD_MOTION = [
  { sel: ".pos-a", travel: 0.3, from: 0.0, to: 0.9, ease: "power1.out" },
  { sel: ".pos-b", travel: 0.7, from: 0.1, to: 1.0, ease: "power2.inOut" },
  { sel: ".pos-c", travel: 0.5, from: 0.05, to: 0.95, ease: "power1.inOut" },
  { sel: ".pos-d", travel: 0.65, from: 0.1, to: 1.0, ease: "power2.out" },
  { sel: ".pos-e", travel: 0.65, from: 0.25, to: 1.0, ease: "power2.inOut" },
  { sel: ".pos-f", travel: 0.2, from: 0.0, to: 0.8, ease: "none" },
  { sel: ".pos-g", travel: 0.35, from: 0.15, to: 1.0, ease: "power1.out" },
  { sel: ".pos-h", travel: 0.45, from: 0.05, to: 0.95, ease: "power2.inOut" },
  { sel: ".pos-i", travel: 0.15, from: 0.0, to: 0.7, ease: "power1.out" },
];

// How "floaty" the cards feel. 0 = glued to the scrollbar,
// higher = they trail behind the scroll a little longer.
const PARALLAX_SMOOTHING = 1.2;

function ReasonIcon({ iconClass, colorHex, FallbackComp }) {
  const color = colorHex || DEFAULT_ACCENT_COLOR;

  if (iconClass) {
    return (
      <i
        className={iconClass}
        style={{ color, fontSize: REASON_ICON_FONT_SIZE, lineHeight: 1 }}
        aria-hidden="true"
      />
    );
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
// CostReductionCard (pos-h) and the logo card (pos-i) are static UI. The
// remaining 6 slots below are filled, in order, from getLandingReasons().
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

  const scroller = useScroller();

  const cards = useMemo(
    () =>
      REASON_SLOTS.map((slot, idx) => {
        const data = reasons?.[idx];
        const FallbackComp = REASON_ICON_MAP[slot.defaultIcon];
        const title = data?.title ?? slot.defaultTitle ?? "عنوان دلیل";
        const description = data?.description ?? DEFAULT_TEXT;

        return {
          // Stable per-slot key: must NOT change once `reasons` loads.
          // GSAP attaches transforms directly to these DOM nodes; a changing
          // key would remount them and lose those transforms.
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
    if (reducedMotion.matches) return;

    const section = sectionRef.current;
    const titles = titlesRef.current;

    // Wait for the real scroller so every trigger below listens to the same one.
    if (!section || !titles || !scroller) return;

    const mm = gsap.matchMedia();

    // -------------------------
    // DESKTOP (>= 769px)
    // -------------------------
    mm.add("(min-width: 769px)", () => {
      // Title rises through the screen
      gsap.fromTo(
        titles,
        { xPercent: -50, yPercent: 70 },
        {
          xPercent: -50,
          yPercent: -270,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            scroller,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      // Cards: one timeline, each card with its own distance, delay and easing
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          scroller,
          start: "top bottom",
          end: "bottom top",
          scrub: PARALLAX_SMOOTHING,
          invalidateOnRefresh: true,
        },
      });

      CARD_MOTION.forEach(({ sel, travel, from, to, ease }) => {
        const el = section.querySelector(sel);
        if (!el) return;

        tl.to(
          el,
          {
            y: () => -window.innerHeight * travel,
            ease,
            duration: to - from,
          },
          from,
        );
      });

      // Make the timeline exactly 1 long so from/to map 1:1 to scroll progress
      tl.set({}, {}, 1);
    });

    // -------------------------
    // MOBILE (<= 768px)
    // -------------------------
    mm.add("(max-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          start: "top 50%",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      // Move down for the whole scroll, fade out only at the end
      tl.to(titles, { y: "140vh", ease: "none", duration: 1 }, 0).to(
        titles,
        { opacity: 0, ease: "none", duration: 0.3 },
        0.7,
      );
    });

    return () => mm.revert();
  }, [scroller]);

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
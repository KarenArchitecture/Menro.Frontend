// src/components/landing/WhyMenroSection.jsx
import React, { useRef, useLayoutEffect } from "react";
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

export default function WhyMenroSection() {
  const sectionRef = useRef(null);
  const innerRef = useRef(null);
  const titlesRef = useRef(null);

  useLayoutEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const inner = innerRef.current;
      const titles = titlesRef.current;

      // --- Pin window (~80% of section height)
      const pinEnd = () => "+=" + Math.max(0, section.offsetHeight * 0.8);

      ScrollTrigger.create({
        trigger: section,
        start: "top",
        end: pinEnd,
        pin: inner,
        pinType: "fixed",
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      // Compute how much to move titles UP so their top hugs the viewport top
      const toTopY = () => {
        const mt = parseFloat(getComputedStyle(titles).marginTop || "0") || 0; // px
        return -mt; // cancel the CSS margin-top during pin
      };

      // Curved intro → hold → curved exit (titles stay at TOP while pinned)
      const ENTER = 0.18; // a hair softer on enter
      const EXIT = 0.18;
      const HOLD = 1 - (ENTER + EXIT);

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: pinEnd,
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
          defaults: { overwrite: "auto" },
        })
        // start slightly below the final TOP position, then glide to top-center
        .fromTo(
          titles,
          { y: () => toTopY() + 36, opacity: 0 },
          { y: toTopY, opacity: 1, ease: "power3.out", duration: ENTER }
        )
        .to(titles, { y: toTopY, opacity: 1, ease: "none", duration: HOLD })
        .to(titles, {
          y: () => toTopY() - 24,
          opacity: 0,
          ease: "power2.in",
          duration: EXIT,
        });

      // --- Cards: delayed start + random reveal + long upward drift
      const cards = gsap.utils.toArray(".why-card");

      cards.forEach((card, i) => {
        // Hard delay before any card starts (≈ “2 seconds” of normal scrolling):
        const baseDelayPx = () =>
          Math.round(Math.max(window.innerHeight * 0.55, 520)); // ~half a screen or 520px

        // Extra randomness per card so they don't all kick in together:
        const randomExtraPx = () =>
          Math.round(gsap.utils.random(60, section.offsetHeight * 0.35, 1));

        // Long travel to feel immersive:
        const travelScroll = () =>
          Math.round(
            Math.max(window.innerHeight * 3.2, section.offsetHeight * 1.4) +
              i * 60
          );

        // Exit well above viewport
        const destY = () =>
          -Math.round(window.innerHeight + 320 + (i % 4) * 100);

        gsap.fromTo(
          card,
          { y: 60, opacity: 0 }, // appear from slightly below
          {
            keyframes: [
              { y: 0, opacity: 1, duration: 0.14, ease: "power3.out" }, // gentle reveal
              { y: destY, duration: 0.76, ease: "none" }, // steady upward drift
              { opacity: 0, duration: 0.1, ease: "power2.in" }, // soften away
            ],
            transformOrigin: "50% 50%",
            scrollTrigger: {
              trigger: section,
              start: () => `top top+=${baseDelayPx() + randomExtraPx()}`, // guaranteed delay + random
              end: () => `+=${travelScroll()}`, // long window (immersion)
              scrub: 0.8,
              invalidateOnRefresh: true,
              // markers: true,
            },
          }
        );
      });

      // Keep measurements fresh
      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);
      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        window.removeEventListener("resize", onResize);
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="why-static" id="why-menro" ref={sectionRef}>
      <div className="why-static__inner" ref={innerRef}>
        <div className="why-static__titles" ref={titlesRef}>
          <h2 className="why-static__title">چرا منرو؟</h2>
          <p className="why-static__subtitle">در لحظه همراه تو</p>
        </div>
      </div>

      <SalesBoostCard className="why-card pos-a" />
      <InfoCard
        className="why-card pos-b"
        icon={<LandingDiamondIcon />}
        title="عنوان دلیل"
      >
        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده
        از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه لورم ایپسوم متن ساختگی
      </InfoCard>
      <InfoCard
        className="why-card pos-c"
        icon={<LandingCubeIcon />}
        title="عنوان دلیل"
      >
        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده
        از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه لورم ایپسوم متن ساختگی
      </InfoCard>
      <CostReductionCard className="why-card why-card--chart pos-h" />
      <InfoCard
        className="why-card pos-d"
        icon={<LandingRankIcon />}
        title="عنوان دلیل"
      >
        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده
        از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه لورم ایپسوم متن ساختگی
      </InfoCard>
      <InfoCard
        className="why-card why-card--tag pos-e"
        icon={<LandingRadarIcon />}
        title="عنوان دلیل"
      >
        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده
        از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه لورم ایپسوم متن ساختگی
      </InfoCard>
      <IconCard
        className="why-card why-card--small pos-f"
        icon={<LandingPcIcon />}
        title="پنل اختصاصی"
      />
      <IconCard
        className="why-card why-card--panel pos-g"
        icon={<LandingWalletIcon />}
        title="مدیریت مالی"
      />
      <IconCard className="why-card why-card--panel pos-i" title="منرو" />
    </section>
  );
}
``;

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
  const titlesRef = useRef(null);

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
      const cards = gsap.utils.toArray(".why-card");

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
      gsap.to(cards, {
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

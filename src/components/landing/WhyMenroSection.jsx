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
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const titles = titlesRef.current;
      const cards = gsap.utils.toArray(".why-card");

      // --- Title: slow vertical slide across the whole section
      // Starts when Why section top touches bottom of viewport (still under hero),
      // ends when Why section bottom reaches top of viewport (fully settled).
      gsap.fromTo(
        titles,
        { yPercent: 70 }, // start well below (feels like coming from behind hero)
        {
          yPercent: -270, // gently overshoot upward feel
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // --- Cards: keep your existing upward drift
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
    }, sectionRef);

    return () => ctx.revert();
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
      <IconCard className="why-card why-card--panel pos-i" title="منرو" />
    </section>
  );
}

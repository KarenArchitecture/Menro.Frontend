import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import SalesBoostCard from "./SalesBoostCard";
import PrivatePanelCard from "./PrivatePanelCard";
import FinancialManagementCard from "./FinancialManagementCard";
import MenroBrandCard from "./MenroBrandCard";
import CostChartCard from "./CostChartCard";
import ReasonCard from "./ReasonCard";

export default function WhyMenroSection() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // انیمیشن ورود ساده - only for the title
      gsap.from(".why-head", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".why-stage",
          start: "top 70%",
          end: "top 30%",
          toggleActions: "play none none reverse",
        },
      });

      // پارالاکس برای کارت‌ها - starts after title reaches top
      gsap.utils.toArray("[data-speed]").forEach((el, index) => {
        const speed = Number(el.getAttribute("data-speed") || 0);

        // Set initial state - cards start below viewport
        gsap.set(el, {
          opacity: 0,
          y: 100, // Start 100px below their initial position
        });

        // Create scroll-triggered animation with proper movement
        ScrollTrigger.create({
          trigger: ".why-wrap",
          start: "top top", // Start when section reaches top
          end: "bottom top",
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            const cardIndex = index;
            const totalCards = gsap.utils.toArray("[data-speed]").length;

            // Stagger the appearance of cards - more delay to prevent overlap
            const cardStartProgress = cardIndex * 0.12; // Each card starts 12% later (increased from 8%)
            const cardEndProgress = 0.5 + cardIndex * 0.08; // Each card ends with more spacing

            let opacity = 0;
            let yPosition = 100; // Start below

            if (progress >= cardStartProgress && progress <= cardEndProgress) {
              // Card is in its active range
              const cardProgress =
                (progress - cardStartProgress) /
                (cardEndProgress - cardStartProgress);

              // Calculate movement - cards move up smoothly
              const maxUpwardMovement = 120; // Maximum upward movement in pixels
              const movementProgress = Math.min(1, cardProgress * 1.2); // Slightly slower acceleration
              yPosition = 100 - maxUpwardMovement * movementProgress;

              // Fade in at the beginning
              if (cardProgress < 0.2) {
                opacity = cardProgress / 0.2; // Fade in over first 20%
              }
              // Stay visible in the middle
              else if (cardProgress < 0.6) {
                opacity = 1; // Fully visible
              }
              // Fade out at the end - NO MOVEMENT during fade out
              else {
                opacity = (1 - cardProgress) / 0.4; // Fade out over last 40%
                // Keep the final position - don't move during fade out
                yPosition = 100 - maxUpwardMovement; // Stay at final position
              }
            }

            // Apply the animations
            gsap.set(el, {
              opacity: Math.max(0, Math.min(1, opacity)),
              y: yPosition,
            });
          },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="why-wrap"
      style={{ minHeight: "400vh", backgroundColor: "#0c0f14" }}
    >
      <div
        className="why-stage"
        style={{
          backgroundColor: "#0c0f14",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* تیتر بخش */}
        <div className="why-head enter" data-speed="-10">
          <h2 className="why-title">
            چرا <span>منرو</span>؟
          </h2>
          <p className="why-sub">هر لحظه همراه تو</p>
        </div>

        {/* پنل اختصاصی - Top Middle */}
        <PrivatePanelCard
          className="card card-top-middle"
          dataSpeed="-15"
          style={{
            position: "absolute",
            right: "45%",
            top: "80vh", // Start closer to viewport for bottom appearance
            transform: "translateX(50%)",
            zIndex: 10,
          }}
        />

        {/* کارت افزایش فروش - Top Right */}
        <SalesBoostCard
          className="card card-top-right"
          dataSpeed="-22"
          style={{
            position: "absolute",
            right: "8%",
            top: "90vh", // Start closer to viewport for bottom appearance
            zIndex: 10,
          }}
        />

        {/* کارت منرو - Mid Left */}
        <MenroBrandCard
          className="card card-mid-left"
          dataSpeed="-8"
          style={{
            position: "absolute",
            right: "60%",
            top: "100vh", // Start closer to viewport for bottom appearance
            zIndex: 10,
          }}
        />

        {/* کارت‌های دلیل - Middle */}
        <ReasonCard
          className="card card-middle-left"
          dataSpeed="-12"
          style={{
            position: "absolute",
            right: "55%",
            top: "110vh", // Start closer to viewport for bottom appearance
            zIndex: 10,
          }}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <polyline
                points="9,22 9,12 15,12 15,22"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          }
        />

        <ReasonCard
          className="card card-middle-right"
          dataSpeed="-18"
          style={{
            position: "absolute",
            right: "20%",
            top: "120vh", // Start closer to viewport for bottom appearance
            zIndex: 10,
          }}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M23 4v6h-6" stroke="currentColor" strokeWidth="2" />
              <path
                d="M20.49 15a9 9 0 1 1-2.12-9.36L23 4"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          }
        />

        <ReasonCard
          className="card card-bottom-left"
          dataSpeed="-6"
          style={{
            position: "absolute",
            right: "50%",
            top: "130vh", // Start closer to viewport for bottom appearance
            zIndex: 10,
          }}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 3h12l4 6-10 13L2 9l4-6z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M11 3L8 9l4 13 4-13-3-6"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          }
        />

        <ReasonCard
          className="card card-bottom-middle"
          dataSpeed="-14"
          style={{
            position: "absolute",
            right: "35%",
            top: "140vh", // Start closer to viewport for bottom appearance
            zIndex: 10,
          }}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <polyline
                points="3.27,6.96 12,12.01 20.73,6.96"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="12"
                y1="22.08"
                x2="12"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          }
        />

        {/* کاهش هزینه نرم‌افزاری - Bottom Left */}
        <CostChartCard
          className="card card-bottom-left-large"
          dataSpeed="-10"
          style={{
            position: "absolute",
            right: "15%",
            top: "150vh", // Start closer to viewport for bottom appearance
            zIndex: 10,
          }}
        />

        {/* مدیریت مالی - Bottom Right */}
        <FinancialManagementCard
          className="card card-bottom-right"
          dataSpeed="-16"
          style={{
            position: "absolute",
            right: "5%",
            top: "160vh", // Start closer to viewport for bottom appearance
            zIndex: 10,
          }}
        />
      </div>

      {/* Colored section below to show where animation ends */}
      <div
        style={{
          height: "100vh",
          backgroundColor: "#1a1a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "2rem",
          fontWeight: "bold",
        }}
      >
        Next Section - Animation Complete
      </div>
    </section>
  );
}

// components/cards/CostReductionCard.jsx
import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import LandingCostReductionIcon from "../icons/LandingCostReductionIcon";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export default function CostReductionCard({
  label = "کاهش هزینه نرم افزاری",
  value = 300,
  className = "",
}) {
  const cardRef = useRef(null);
  const pathRef = useRef(null);
  const dotGroupRef = useRef(null);
  const valueRef = useRef(null);

  // 1. Add state to hold the detected scroller
  const [scroller, setScroller] = useState(null);

  // 2. Detect the scroller safely after paint
  useEffect(() => {
    const detectScroller = () => {
      let activeScroller = window;
      const customContainer = document.querySelector(".app-shell__content");

      if (customContainer) {
        const styles = window.getComputedStyle(customContainer);
        if (styles.overflowY === "auto" || styles.overflowY === "scroll") {
          activeScroller = customContainer;
        }
      }
      setScroller(activeScroller);
    };

    detectScroller();
    window.addEventListener("resize", detectScroller);

    return () => window.removeEventListener("resize", detectScroller);
  }, []);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const path = pathRef.current;
    const dotGroup = dotGroupRef.current;

    // 3. Wait until the scroller is identified
    if (!card || !path || !dotGroup || !scroller) return;

    const len = path.getTotalLength();

    // 4. Pass the detected scroller to ScrollTrigger
    const st = {
      trigger: card,
      scroller: scroller,
      start: "top 98%",
      end: "top 30%",
      scrub: true,
    };

    const ctx = gsap.context(() => {
      // Count number 0 -> value
      const counter = { n: 0 };
      gsap.to(counter, {
        n: value,
        ease: "none",
        scrollTrigger: st,
        onUpdate: () => {
          if (valueRef.current)
            valueRef.current.textContent = `+${Math.round(counter.n)}%`;
        },
      });

      // Keep the dot glued to the path (no drift)
      gsap.to(dotGroup, {
        motionPath: {
          path,
          align: path,
          alignOrigin: [0.5, 0.5], // center of the dot group
          start: 0,
          end: 1,
        },
        ease: "none",
        scrollTrigger: st,
      });
    }, cardRef);

    return () => ctx.revert();
  }, [value, scroller]); // 5. Add scroller as a dependency

  return (
    <div className={`why-card cost-reduction ${className}`} ref={cardRef}>
      <div className="cost-reduction__icon" aria-hidden>
        <LandingCostReductionIcon />
      </div>

      {/* Single SVG so coordinates match */}
      <svg
        className="cost-chart"
        width="300"
        height="201"
        viewBox="0 0 300 201"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pathRef}
          d="M0 178C8.8 195 30.5 204.5 45 196C75.3 178.24 74.5 145.35 95.733 145.35C114 145.35 116.094 173.323 133.401 171.325C150.708 169.327 145.618 91.9065 179.722 93.4049C213.827 94.9034 214.845 42.9569 222.99 41.9579C231.134 40.9589 227.571 75.4234 250.986 75.4234C274.401 75.4234 269.311 25.9743 286.618 25.4748C300.463 25.0752 302.567 8.99177 301.889 1"
          stroke="rgba(243,246,252,0.5)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Dot wrapped in a <g>; MotionPathPlugin will translate this group */}
        <g ref={dotGroupRef}>
          <circle r="8" fill="#FF683C" cx="0" cy="0" />
          <circle r="13" fill="rgba(209,120,66,0.4)" cx="0" cy="0" />
        </g>
      </svg>

      <div className="badge">{label}</div>
      <div className="kpi" ref={valueRef}>
        +0%
      </div>
    </div>
  );
}

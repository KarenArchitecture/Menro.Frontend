// components/cards/CostReductionCard.jsx
import React, { useRef, useLayoutEffect } from "react";
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

  useLayoutEffect(() => {
    const card = cardRef.current;
    const path = pathRef.current;
    const dotGroup = dotGroupRef.current;
    if (!card || !path || !dotGroup) return;

    const len = path.getTotalLength();
    const st = { trigger: card, start: "top 98%", end: "top 30%", scrub: true };

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

      // OPTIONAL: draw the line as it scrolls
      // path.style.strokeDasharray = len;
      // path.style.strokeDashoffset = len;
      // gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: st });
    }, cardRef);

    return () => ctx.revert();
  }, [value]);

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

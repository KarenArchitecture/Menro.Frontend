import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LandingChartIcon from "../icons/LandingChartIcon";
gsap.registerPlugin(ScrollTrigger);

export default function SalesBoostCard({
  value = 200,
  subtitle = "افزایش فروش",
  className = "",
}) {
  const cardRef = useRef(null);
  const circleRef = useRef(null);
  const valueRef = useRef(null);

  useLayoutEffect(() => {
    const el = cardRef.current;
    const circle = circleRef.current;
    const radius = 82; // matches SVG (r)
    const C = 2 * Math.PI * radius; // circumference

    // set stroke length + start empty
    circle.style.strokeDasharray = C;
    circle.style.strokeDashoffset = C;

    // ring fill
    gsap.to(circle, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 98%",
        end: "top 30%",
        scrub: true,
      },
    });

    // number count
    const counter = { n: 0 };
    gsap.to(counter, {
      n: value,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        end: "top 30%",
        scrub: true,
      },
      onUpdate: () =>
        (valueRef.current.textContent = `+${Math.round(counter.n)}%`),
    });
  }, [value]);

  return (
    <div ref={cardRef} className={`why-card sales-boost ${className}`}>
      <div className="sales-boost__ring">
        <svg width="120" height="120" viewBox="0 0 180 180">
          {/* base thin gray ring */}
          <circle
            cx="90"
            cy="90"
            r="82"
            fill="none"
            stroke="#000"
            strokeWidth="8"
          />
          {/* animated white progress ring */}
          <circle
            ref={circleRef}
            cx="90"
            cy="90"
            r="82"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>

        <div className="sales-boost__content">
          <LandingChartIcon />
          <div className="sales-boost__value" ref={valueRef}>
            +0%
          </div>
          <div className="sales-boost__subtitle">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

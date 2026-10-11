// components/cards/CostReductionCard.jsx
import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import LandingCostReductionIcon from "../icons/LandingCostReductionIcon";
import useScroller from "./UseScroller";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// 0 = card's top edge touches the bottom of the viewport (just entering)
// 1 = card's bottom edge touches the top of the viewport (fully gone)
//
// FINISH_AT is the point of that pass where the animation reaches 100%.
// 1    -> finishes exactly as the card leaves the screen (what was asked).
// 0.85 -> finishes a little earlier so people can see the final value.
const FINISH_AT = 1;

// How long the animation takes to catch up with the scroll position (seconds).
const SMOOTHING = 0.45;

export default function CostReductionCard({
  label = "کاهش هزینه نرم افزاری",
  value = 300,
  className = "",
}) {
  const cardRef = useRef(null);
  const pathRef = useRef(null);
  const dotGroupRef = useRef(null);
  const valueRef = useRef(null);

  const scroller = useScroller();

  useLayoutEffect(() => {
    const card = cardRef.current;
    const path = pathRef.current;
    const dotGroup = dotGroupRef.current;

    if (!card || !path || !dotGroup || !scroller) return;

    // The section is never transformed, so it is a safe trigger. The card
    // itself is NOT (the section moves it for the parallax), which is why its
    // own position can't be used for the start/end markers.
    const section = card.closest(".why-static") || card.parentElement;

    if (valueRef.current) valueRef.current.textContent = "+0%";

    const ctx = gsap.context(() => {
      // One paused timeline holds the whole animation: number + dot on path.
      const counter = { n: 0 };
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      tl.to(
        counter,
        {
          n: value,
          duration: 1,
          onUpdate: () => {
            if (valueRef.current) {
              valueRef.current.textContent = `+${Math.round(counter.n)}%`;
            }
          },
        },
        0,
      );

      tl.to(
        dotGroup,
        {
          motionPath: {
            path,
            align: path,
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 1,
          },
          duration: 1,
          immediateRender: true, // park the dot at the path start right away
        },
        0,
      );

      const getViewport = () => {
        if (scroller === window) return { top: 0, height: window.innerHeight };
        const r = scroller.getBoundingClientRect();
        return { top: r.top, height: r.height };
      };

      // Where is the card on screen RIGHT NOW (transforms included)?
      const update = () => {
        const vp = getViewport();
        const rect = card.getBoundingClientRect();

        const raw =
          (vp.top + vp.height - rect.top) / (vp.height + rect.height);
        const target = gsap.utils.clamp(0, 1, raw / FINISH_AT);

        gsap.to(tl, {
          progress: target,
          duration: SMOOTHING,
          ease: "power2.out",
          overwrite: true,
        });
      };

      ScrollTrigger.create({
        trigger: section,
        scroller,
        start: "top bottom",
        end: "bottom top",
        onUpdate: update,
        onToggle: update,
        onRefresh: update,
      });

      update();

      // Stored so cleanup can kill the smoothing tween (created outside ctx).
      card._costTl = tl;
    }, cardRef);

    return () => {
      if (card._costTl) {
        gsap.killTweensOf(card._costTl);
        card._costTl.kill();
        card._costTl = null;
      }
      ctx.revert();
    };
  }, [value, scroller]);

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
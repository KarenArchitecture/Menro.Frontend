import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import LandingChartIcon from "../icons/LandingChartIcon";

// helper → makes triangle loop (0 → 1 → 0)
function triangle01(x) {
  const t = x % 1;
  return t < 0.5 ? t * 2 : (1 - t) * 2;
}

export default function SalesBoostCard({
  className = "",
  dataSpeed = 0,
  Icon,
  label = "افزایش فروش",
  cycles = 4, // how many ups/downs
  scrollSpan = 1400, // scroll distance for loop
}) {
  const root = useRef(null);
  const valueRef = useRef(null);
  const arcRef = useRef(null);

  const IconCmp = Icon ?? LandingChartIcon;

  // SVG ring geometry
  const size = 220;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;

  useLayoutEffect(() => {
    const el = root.current;
    const valueEl = valueRef.current;
    const arcEl = arcRef.current;

    if (!el || !valueEl || !arcEl) return;

    // Initialize GSAP animations

    // Set initial visibility without animations
    gsap.set(el, { opacity: 1, y: 0 });

    // Initialize ring arc
    gsap.set(arcEl, { strokeDasharray: C, strokeDashoffset: C });

    // Scroll-triggered fade in/out animation
    gsap.fromTo(
      el,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse",
          scrub: false,
        },
      }
    );

    // Drive loop with scroll progress - smooth animation up to 100%
    ScrollTrigger.create({
      trigger: ".why-stage",
      start: "top 70%",
      end: `+=${scrollSpan}`,
      scrub: 1, // Smooth scrubbing
      onUpdate(self) {
        const progress = self.progress; // 0 to 1
        const pct = Math.round(progress * 100); // 0 to 100%

        // update number
        if (valueEl) {
          valueEl.textContent = `+${pct.toLocaleString("fa-IR")}٪`;
        }

        // update arc - smooth filling
        const offset = C * (1 - progress);
        if (arcEl) {
          arcEl.style.strokeDashoffset = offset;
        }
      },
    });
  }, [C, cycles, scrollSpan]);

  return (
    <div
      ref={root}
      className={`sales-card ${className}`}
      data-speed={dataSpeed}
      style={{
        position: "absolute",
        zIndex: 10,
      }}
    >
      <div className="sales-card__inner">
        <div className="sales-card__ring">
          <svg
            className="ring-svg"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            <circle
              className="ring-bg"
              cx={size / 2}
              cy={size / 2}
              r={r}
              strokeWidth={stroke}
              fill="none"
            />
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              <circle
                ref={arcRef}
                className="ring-arc"
                cx={size / 2}
                cy={size / 2}
                r={r}
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>

          <div className="sales-card__center">
            <IconCmp className="sales-card__icon" />
            <div ref={valueRef} className="sales-card__value">
              +۰٪
            </div>
            <div className="sales-card__caption">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

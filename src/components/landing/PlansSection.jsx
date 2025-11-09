import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import PlanCard from "./PlanCard";
import plansData from "./plans";

const SCROLL_FACTOR = 2000; // bigger = slower scrub
const EPS = 0.001;

export default function PlansSection({ plans = plansData }) {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const progress = useMotionValue(0); // 0..1 manual progress

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const getNavH = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(
        "--nav-h"
      );
      const n = parseInt(v || "96", 10);
      return Number.isFinite(n) ? n : 96;
    };

    const inPinnedViewport = () => {
      const rect = el.getBoundingClientRect();
      const vpH = window.innerHeight;
      const navH = getNavH();
      // Section spans the viewport area under the header while pinned
      return rect.top <= navH + EPS && rect.bottom >= vpH - EPS;
    };

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const onWheel = (e) => {
      if (!inPinnedViewport()) return;

      const v = progress.get();
      const atStart = v <= EPS;
      const atEnd = v >= 1 - EPS;
      const forward = e.deltaY > 0;

      // RELEASE at boundaries in the scroll direction (let page move)
      if ((atStart && !forward) || (atEnd && forward)) return;

      // Otherwise capture and scrub
      e.preventDefault();
      const delta = Math.max(-80, Math.min(80, e.deltaY)); // clamp spikes
      const next = clamp01(v + delta / SCROLL_FACTOR);
      progress.set(next);

      // Keep the page visually parked while capturing
      const rect = el.getBoundingClientRect();
      const lockTop = window.scrollY + rect.top;
      window.scrollTo({ top: lockTop });
    };

    // Touch support (reverse on swipe down)
    let lastY = null;
    const onTouchStart = (e) => {
      lastY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (!inPinnedViewport()) return;

      const y = e.touches[0].clientY;
      const dy = lastY == null ? 0 : lastY - y; // finger up => forward
      lastY = y;

      const v = progress.get();
      const atStart = v <= EPS;
      const atEnd = v >= 1 - EPS;
      const forward = dy > 0;

      if ((atStart && !forward) || (atEnd && forward)) return;

      e.preventDefault();
      const next = clamp01(v + dy / (SCROLL_FACTOR * 0.9));
      progress.set(next);

      const rect = el.getBoundingClientRect();
      const lockTop = window.scrollY + rect.top;
      window.scrollTo({ top: lockTop });
    };
    const onTouchEnd = () => {
      lastY = null;
    };

    const opts = { passive: false };
    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("touchstart", onTouchStart, opts);
    window.addEventListener("touchmove", onTouchMove, opts);
    window.addEventListener("touchend", onTouchEnd, opts);

    return () => {
      window.removeEventListener("wheel", onWheel, opts);
      window.removeEventListener("touchstart", onTouchStart, opts);
      window.removeEventListener("touchmove", onTouchMove, opts);
      window.removeEventListener("touchend", onTouchEnd, opts);
    };
  }, [progress]);

  // active tab indicator from manual progress (plays forward/backward)
  useEffect(() => {
    const total = plans.length || 1;
    return progress.on("change", (v) => {
      const seg = 1 / (total + 1);
      let cur = 0;
      for (let i = 0; i < total; i++) if (v >= (i + 0.5) * seg) cur = i;
      setActiveStep(cur);
    });
  }, [plans, progress]);

  return (
    <section
      ref={sectionRef}
      className="plans-pin"
      aria-labelledby="plans-title"
    >
      <div className="plans-pin__sticky">
        <div className="plans__tabs" role="tablist" aria-label="انتخاب پلن">
          {plans.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={i === activeStep}
              className={`plans__tab ${i === activeStep ? "is-active" : ""}`}
              type="button"
              onClick={() => progress.set((i + 0.5) / (plans.length + 1))}
            >
              {p.label}
            </button>
          ))}
        </div>

        <h2 id="plans-title" className="sr-only">
          پلن‌های منرو
        </h2>

        <div className="plans__deck">
          {plans.map((plan, index) => (
            <PlanMotionCard
              key={plan.id}
              index={index}
              total={plans.length}
              plan={plan}
              progress={progress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanMotionCard({ index, total, plan, progress }) {
  const seg = 1 / (total + 1);
  const start = index * seg;
  const mid = (index + 0.5) * seg;
  const end = (index + 1) * seg;

  const baseY = index * 32;
  const baseScale = 1 - index * 0.04;

  const y = useTransform(
    progress,
    [0, start, mid, end, 1],
    [baseY, baseY, 0, -220, -260]
  );
  const scale = useTransform(
    progress,
    [0, start, mid, end, 1],
    [baseScale, baseScale, 1, 1, 1]
  );
  const zIndex = useTransform(
    progress,
    [0, start, mid, end, 1],
    [20 - index, 20 - index, 60, 0, 0]
  );

  return (
    <motion.div className="plans__deck-card" style={{ y, scale, zIndex }}>
      <PlanCard plan={plan} />
    </motion.div>
  );
}

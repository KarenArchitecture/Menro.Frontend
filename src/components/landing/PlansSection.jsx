import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import PlanCard from "./PlanCard";
import plansData from "./plans";

const SCROLL_FACTOR = 3000; // wheel scrub speed
const EPS = 0.001;

export default function PlansSection({ plans = plansData }) {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [viewportH, setViewportH] = useState(900);
  const progress = useMotionValue(0); // 0..1

  useEffect(() => {
    setViewportH(window.innerHeight || 900);
  }, []);

  // --- helpers ---
  const getNavH = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(
      "--nav-h"
    );
    const n = parseInt(v || "96", 10);
    return Number.isFinite(n) ? n : 96;
  };

  // ✅ OPTION A: Loosen the engagement window so fast scrolls still trigger
  const inPinnedViewport = () => {
    const el = sectionRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const vpH = window.innerHeight;
    const navH = getNavH();

    const TOP_TOL = 120; // px tolerance above header line
    const BOTTOM_VIS = vpH * 0.35; // require only 35% of viewport below

    // Was: rect.top <= navH + EPS && rect.bottom >= vpH - EPS
    return rect.top <= navH + TOP_TOL && rect.bottom >= BOTTOM_VIS;
  };

  const focusTab = (index) => {
    const el = sectionRef.current;
    if (!el) return;

    // 1) Ensure the section is pinned/visible under the header
    const rect = el.getBoundingClientRect();
    const docTop = window.pageYOffset || document.documentElement.scrollTop;
    const sectionTop = docTop + rect.top;

    if (!inPinnedViewport()) {
      window.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      });
    }

    // 2) Animate progress to the selected card's midpoint
    const seg = 1 / (plans.length + 1);
    // slightly past midpoint so previous cards are definitely out
    const target = Math.min(1, (index + 0.52) * seg);

    // cancel any running animation and animate this value
    const controls = animate(progress, target, {
      duration: 0.55,
      ease: [0.22, 0.68, 0.2, 0.99], // nice ease-out
    });

    // Optional: stop if component unmounts
    return () => controls.stop();
  };

  // --- wheel/touch scrub (unchanged) ---
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const onWheel = (e) => {
      if (!inPinnedViewport()) return;
      const v = progress.get();
      const atStart = v <= EPS;
      const atEnd = v >= 1 - EPS;
      const forward = e.deltaY > 0;
      if ((atStart && !forward) || (atEnd && forward)) return;

      e.preventDefault();
      const delta = Math.max(-80, Math.min(80, e.deltaY));
      const next = clamp01(v + delta / SCROLL_FACTOR);
      progress.set(next);

      const rect = el.getBoundingClientRect();
      const lockTop = window.scrollY + rect.top;
      window.scrollTo({ top: lockTop });
    };

    let lastY = null;
    const onTouchStart = (e) => {
      lastY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (!inPinnedViewport()) return;
      const y = e.touches[0].clientY;
      const dy = lastY == null ? 0 : lastY - y; // up => forward
      lastY = y;

      const v = progress.get();
      const atStart = v <= EPS;
      const atEnd = v >= 1 - EPS;
      const forward = dy > 0;
      if ((atStart && !forward) || (atEnd && forward)) return;

      e.preventDefault();
      const next = Math.max(0, Math.min(1, v + dy / (SCROLL_FACTOR * 0.9)));
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

  // active tab highlight driven by progress
  useEffect(() => {
    const total = plans.length || 1;
    return progress.on("change", (v) => {
      const seg = 1 / (total + 1);
      let cur = 0;
      for (let i = 0; i < total; i++) if (v >= (i + 0.5) * seg) cur = i;
      setActiveStep(cur);
    });
  }, [plans, progress]);

  // fade header + disable its clicks only while interacting with the deck
  useEffect(() => {
    const header = document.querySelector(".app-header");
    if (!header) return;

    const off = progress.on("change", (v) => {
      const dim = v > 0.02 && v < 0.98;
      header.classList.toggle("is-dim", dim);
    });

    return () => off();
  }, [progress]);

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
              onClick={() => focusTab(i)}
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
              viewportH={viewportH}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanMotionCard({ index, total, plan, progress, viewportH }) {
  const seg = 1 / (total + 1);
  const start = index * seg;
  const mid = (index + 0.5) * seg;
  const end = (index + 1) * seg;

  const baseY = index * 32;
  const baseScale = 1 - index * 0.04;

  // fly well above viewport (adjust multiplier to taste)
  const outY = -Math.max(320, Math.round(viewportH * 0.8));

  const y = useTransform(
    progress,
    [0, start, mid, end, 1],
    [baseY, baseY, 0, outY, outY]
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

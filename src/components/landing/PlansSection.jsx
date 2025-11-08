import React, { useState } from "react";
import PlanCard from "./PlanCard";
import plansData from "./plans";

// rank helper: which layer is this card relative to the active one
function getRank(index, activeIndex, total) {
  return (index - activeIndex + total) % total; // 0 = front, 1 = behind it, ...
}

// visual style for each rank (0 = front)
function getStackStyle(rank, maxVisible = 4) {
  // hide anything deeper than maxVisible (if you ever add more than 4 plans)
  if (rank >= maxVisible) {
    return {
      opacity: 0,
      pointerEvents: "none",
      transform: "translateY(40px) scale(0.85)",
      zIndex: 0,
    };
  }

  const SCALE_STEP = 0.04; // how much smaller each layer gets
  const Y_STEP = 24; // how much lower each layer goes (px)

  const scale = 1 - rank * SCALE_STEP; // 1, 0.96, 0.92, ...
  const y = rank * Y_STEP; // 0, 24, 48, ...

  return {
    transform: `translateY(${y}px) scale(${scale})`,
    zIndex: maxVisible - rank, // front card always on top
  };
}

export default function PlansSection({ plans = plansData }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = plans.length;
  const maxVisible = Math.min(total, 4);

  return (
    <section className="plans plans--stack" aria-labelledby="plans-title">
      {/* Tabs */}
      <div className="plans__tabs" role="tablist" aria-label="انتخاب پلن">
        {plans.map((p, i) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={i === activeIndex}
            className={`plans__tab ${i === activeIndex ? "is-active" : ""}`}
            type="button"
            onClick={() => setActiveIndex(i)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <h2 id="plans-title" className="sr-only">
        پلن‌های منرو
      </h2>

      {/* Stacked deck */}
      <div className="plans__deck">
        {plans.map((p, i) => {
          const rank = getRank(i, activeIndex, total); // 0 = front
          const style = getStackStyle(rank, maxVisible);

          return (
            <div
              key={p.id}
              className={`plans__deck-card ${rank === 0 ? "is-active" : ""}`}
              style={style}
            >
              <PlanCard plan={p} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

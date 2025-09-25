// start code
import React, { useState } from "react";
import PlanCard from "./PlanCard";
import plansData from "./plans";

export default function PlansSection({
  plans = plansData,
  initialActiveId,
  checkIconSrc = "../icons/GreenCheckIcon.jsx",
}) {
  const defaultId = initialActiveId ?? (plans[0]?.id || "");
  const [activeId, setActiveId] = useState(defaultId);
  const activePlan = plans.find((p) => p.id === activeId) ?? plans[0];

  return (
    <section className="plans" aria-labelledby="plans-title">
      {/* Tabs */}
      <div className="plans__tabs" role="tablist" aria-label="انتخاب پلن">
        {plans.map((p) => {
          const isActive = p.id === activePlan.id;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={isActive}
              className={`plans__tab ${isActive ? "is-active" : ""}`}
              type="button"
              onClick={() => setActiveId(p.id)}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Decorative stack (optional) */}
      <div className="plans__stack" aria-hidden="true">
        <div className="plans__stack-card plans__stack-card--1" />
        <div className="plans__stack-card plans__stack-card--2" />
      </div>

      {/* Active plan card */}
      <h2 id="plans-title" className="sr-only">
        پلن‌های منرو
      </h2>
      <PlanCard plan={activePlan} checkIconSrc={checkIconSrc} />
    </section>
  );
}

// PlansSection.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import PlanCard from "./PlanCard";
import plansData from "./plans";

function getRank(index, activeIndex, total) {
  return (index - activeIndex + total) % total; // 0..3
}

export default function PlansSection({ plans = plansData, initialActiveId }) {
  const defaultId = initialActiveId ?? (plans[0]?.id || "");
  const [activeId, setActiveId] = useState(defaultId);
  const [isAnimating, setIsAnimating] = useState(false);

  const activeIndex = useMemo(
    () =>
      Math.max(
        0,
        plans.findIndex((p) => p.id === activeId)
      ),
    [plans, activeId]
  );

  const cardRefs = useRef([]); // .plans__deck-card nodes

  // ===== Animation tuning =====
  const T = {
    reflow: 0.38, // others shifting to new ranks
    lift: 0.34, // selected lifting forward
    settle: 0.22, // selected settling from overshoot
    contentIn: 0.25, // content fade in
    fadeOut: 0.18, // old content fade out
    stagger: 0.04, // cascade for other cards reflow
  };
  const EASE_OUT = "power2.out";
  const EASE_IN = "power2.in";
  const EASE_IO = "power2.inOut";
  const OVERSHOOT = 1.035; // tiny scale overshoot
  const LIFT_Y = -22; // small upward lift

  // Visual states per rank (front -> deepest)
  const STATES = useMemo(
    () => [
      { scale: 1.0, y: 0, z: 40, shadow: "0 20px 60px rgba(0,0,0,0.45)" },
      { scale: 0.955, y: 20, z: 30, shadow: "0 18px 50px rgba(0,0,0,0.35)" },
      { scale: 0.92, y: 40, z: 20, shadow: "0 16px 40px rgba(0,0,0,0.28)" },
      { scale: 0.9, y: 60, z: 10, shadow: "0 14px 32px rgba(0,0,0,0.22)" },
    ],
    []
  );

  const placeInstant = (ai) => {
    cardRefs.current.forEach((wrapEl, i) => {
      if (!wrapEl) return;
      const rank = getRank(i, ai, plans.length);
      const st = STATES[rank];

      gsap.set(wrapEl, { y: st.y, scale: st.scale, zIndex: st.z });
      const cardEl = wrapEl.querySelector(".plan-card");
      if (cardEl) gsap.set(cardEl, { boxShadow: st.shadow });

      const contentEl = wrapEl.querySelector(".plan-card__content");
      if (contentEl) {
        if (rank === 0)
          gsap.set(contentEl, { autoAlpha: 1, y: 0, pointerEvents: "auto" });
        else gsap.set(contentEl, { autoAlpha: 0, y: 8, pointerEvents: "none" });
      }
      wrapEl.classList.toggle("is-active", rank === 0);
    });
  };

  useEffect(() => {
    placeInstant(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shuffleTo = (targetIndex) => {
    if (isAnimating || targetIndex === activeIndex) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setActiveId(plans[targetIndex].id);
      placeInstant(targetIndex);
      return;
    }

    setIsAnimating(true);

    const tl = gsap.timeline({
      defaults: { overwrite: true },
      onComplete: () => {
        setActiveId(plans[targetIndex].id);
        placeInstant(targetIndex); // snap to canonical state
        setIsAnimating(false);
      },
    });

    const selectedEl = cardRefs.current[targetIndex];
    const currentActiveEl = cardRefs.current[activeIndex];
    if (!selectedEl) return;

    // 1) Fade out current content early (cleaner)
    const currentContent = currentActiveEl?.querySelector(
      ".plan-card__content"
    );
    if (currentContent) {
      tl.to(
        currentContent,
        { autoAlpha: 0, y: 8, duration: T.fadeOut, ease: EASE_IN },
        0
      );
      tl.set(currentContent, { pointerEvents: "none" }, 0);
    }

    // 2) Reflow everyone to their new ranks (short stagger for depth feel)
    cardRefs.current.forEach((wrapEl, i) => {
      if (!wrapEl) return;
      const rank = getRank(i, targetIndex, plans.length);
      const st = STATES[rank];

      const at = i === targetIndex ? 0 : i * T.stagger;

      tl.to(
        wrapEl,
        {
          y: st.y,
          scale: st.scale,
          zIndex: st.z,
          duration: T.reflow,
          ease: EASE_IO,
        },
        at
      );

      const cardEl = wrapEl.querySelector(".plan-card");
      if (cardEl) {
        tl.to(
          cardEl,
          { boxShadow: st.shadow, duration: T.reflow, ease: EASE_IO },
          `<`
        );
      }
    });

    // 3) Selected: gentle lift with overshoot, then settle
    const front = STATES[0];
    const selectedContent = selectedEl.querySelector(".plan-card__content");

    tl.set(selectedEl, { zIndex: 100 }, 0); // ensure on top during lift
    tl.to(
      selectedEl,
      {
        y: front.y + LIFT_Y,
        scale: OVERSHOOT,
        duration: T.lift,
        ease: EASE_OUT,
      },
      0.06
    );
    tl.to(
      selectedEl,
      { y: front.y, scale: 1, duration: T.settle, ease: EASE_IN },
      `>-0.02`
    );

    // 4) Selected content fades in after settle
    if (selectedContent) {
      tl.fromTo(
        selectedContent,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: T.contentIn,
          ease: EASE_OUT,
          onStart: () => gsap.set(selectedContent, { pointerEvents: "auto" }),
        },
        `>-0.05`
      );
    }
  };

  return (
    <section
      className={`plans${isAnimating ? " is-animating" : ""}`}
      aria-labelledby="plans-title"
    >
      {/* Tabs */}
      <div className="plans__tabs" role="tablist" aria-label="انتخاب پلن">
        {plans.map((p, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={isActive}
              className={`plans__tab ${isActive ? "is-active" : ""}`}
              type="button"
              onClick={() => shuffleTo(i)}
              disabled={isAnimating}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <h2 id="plans-title" className="sr-only">
        پلن‌های منرو
      </h2>

      {/* Deck */}
      <div className="plans__deck">
        {plans.map((p, i) => (
          <div
            key={p.id}
            className="plans__deck-card"
            ref={(el) => (cardRefs.current[i] = el)}
            data-index={i}
          >
            <PlanCard plan={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

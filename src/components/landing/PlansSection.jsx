// PlansSection.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import PlanCard from "./PlanCard";
import plansData from "./plans";

function getRank(index, activeIndex, total) {
  // 0 = front, 1 = behind, 2 = deeper, 3 = deepest
  return (index - activeIndex + total) % total;
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

  const cardRefs = useRef([]); // holds .plans__deck-card nodes

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

  const layoutTo = (ai, animate = true) => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const dur = animate && !reduce ? 0.55 : 0;
    const ease = "power3.out";

    cardRefs.current.forEach((wrapEl, i) => {
      if (!wrapEl) return;
      const rank = getRank(i, ai, plans.length);
      const st = STATES[rank];

      gsap.to(wrapEl, {
        y: st.y,
        scale: st.scale,
        zIndex: st.z,
        duration: dur,
        ease,
        overwrite: true,
      });

      const cardEl = wrapEl.querySelector(".plan-card");
      if (cardEl) {
        gsap.to(cardEl, {
          boxShadow: st.shadow,
          duration: dur,
          ease,
          overwrite: true,
        });
      }

      const contentEl = wrapEl.querySelector(".plan-card__content");
      if (contentEl) {
        if (rank === 0) {
          gsap.to(contentEl, {
            autoAlpha: 1,
            y: 0,
            duration: dur ? 0.35 : 0,
            ease: "power2.out",
            delay: dur ? 0.1 : 0,
            overwrite: true,
            onStart: () => gsap.set(contentEl, { pointerEvents: "auto" }),
          });
        } else {
          gsap.to(contentEl, {
            autoAlpha: 0,
            y: 8,
            duration: dur ? 0.3 : 0,
            ease: "power2.out",
            overwrite: true,
            onStart: () => gsap.set(contentEl, { pointerEvents: "none" }),
          });
        }
      }

      wrapEl.classList.toggle("is-active", rank === 0);
    });
  };

  // initial placement
  useEffect(() => {
    layoutTo(activeIndex, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- SHUFFLE: drop selected down -> others reflow -> selected rises to front
  const shuffleTo = (targetIndex) => {
    if (isAnimating || targetIndex === activeIndex) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setActiveId(plans[targetIndex].id);
      layoutTo(targetIndex, false);
      return;
    }

    setIsAnimating(true);

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        setActiveId(plans[targetIndex].id);
        layoutTo(targetIndex, false); // lock exact final transforms
        setIsAnimating(false);
      },
    });

    const selectedEl = cardRefs.current[targetIndex];
    const currentActiveEl = cardRefs.current[activeIndex];
    if (!selectedEl) return;

    // Fade out the current active card's content quickly
    const currentContent = currentActiveEl?.querySelector(
      ".plan-card__content"
    );
    if (currentContent) {
      tl.to(
        currentContent,
        { autoAlpha: 0, y: 8, duration: 0.18, ease: "power2.inOut" },
        0
      );
    }

    // ---- Phase A: selected drops DOWN behind the deck (still behind).
    // Use a relative drop so it always goes further than the deepest card.
    const DROP = 140; // px
    const selectedStartRank = getRank(targetIndex, activeIndex, plans.length);
    const selectedStartScale = STATES[selectedStartRank].scale;
    tl.to(
      selectedEl,
      {
        y: `+=${DROP}`,
        scale: Math.max(0.88, selectedStartScale - 0.04),
        zIndex: Math.min(5, STATES[selectedStartRank].z), // ensure it's behind during the drop
        duration: 0.26,
        ease: "power2.in",
      },
      0
    );

    // ---- Phase B: while it's down, move EVERY card to its new ranks
    cardRefs.current.forEach((wrapEl, i) => {
      if (!wrapEl || i === targetIndex) return;
      const rank = getRank(i, targetIndex, plans.length); // ranks after selection
      const st = STATES[rank];

      tl.to(
        wrapEl,
        {
          y: st.y,
          scale: st.scale,
          zIndex: st.z,
          duration: 0.48,
          ease: "power3.out",
          overwrite: true,
        },
        0.12 // begins just after the drop starts
      );

      const cardEl = wrapEl.querySelector(".plan-card");
      if (cardEl) {
        tl.to(
          cardEl,
          { boxShadow: st.shadow, duration: 0.48, ease: "power3.out" },
          "<"
        );
      }
    });

    // ---- Phase C: selected comes FORWARD and UP to the front
    const front = STATES[0];
    const selectedContent = selectedEl.querySelector(".plan-card__content");

    // bring forward (z-index high), overshoot a hair, then settle
    tl.set(selectedEl, { zIndex: 100 }, 0.34);
    tl.to(
      selectedEl,
      { y: front.y - 10, scale: 1.02, duration: 0.36, ease: "power3.out" },
      0.34
    );
    tl.to(
      selectedEl,
      { y: front.y, scale: 1, duration: 0.2, ease: "power2.out" },
      ">-0.02"
    );

    if (selectedContent) {
      tl.fromTo(
        selectedContent,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
        "-=0.18"
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

      {/* Deck: all four real cards absolutely stacked */}
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

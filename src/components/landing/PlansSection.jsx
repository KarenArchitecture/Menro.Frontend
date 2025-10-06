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

  // ======== SPEED CONTROLS (edit these) ========
  // Increase SPEED for slower motion; decrease for faster.
  const SPEED = 0.5; // very slow. Try 1.0 (normal), 0.7 (faster), 3.0 (super slow)
  const D = {
    layout: 1 * SPEED,
    drop: 1 * SPEED,
    reflow: 1 * SPEED,
    rise: 1 * SPEED,
    settle: 1 * SPEED,
    fadeOut: 1 * SPEED,
    contentIn: 1 * SPEED,
  };
  const LINEAR = "none"; // constant velocity (no ease curve)
  // =============================================

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
    const dur = animate && !reduce ? D.layout : 0;
    const ease = LINEAR;

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
            duration: dur ? D.contentIn : 0,
            ease: LINEAR,
            delay: dur ? 0.1 : 0,
            overwrite: true,
            onStart: () => gsap.set(contentEl, { pointerEvents: "auto" }),
          });
        } else {
          gsap.to(contentEl, {
            autoAlpha: 0,
            y: 8,
            duration: dur ? D.fadeOut : 0,
            ease: LINEAR,
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
      defaults: { ease: LINEAR }, // constant speed
      onComplete: () => {
        setActiveId(plans[targetIndex].id);
        layoutTo(targetIndex, false); // lock exact final transforms
        setIsAnimating(false);
      },
    });

    const selectedEl = cardRefs.current[targetIndex];
    const currentActiveEl = cardRefs.current[activeIndex];
    if (!selectedEl) return;

    // Fade out the current active card's content
    const currentContent = currentActiveEl?.querySelector(
      ".plan-card__content"
    );
    if (currentContent) {
      tl.to(
        currentContent,
        { autoAlpha: 0, y: 8, duration: D.fadeOut, ease: LINEAR },
        0
      );
    }

    // ---- Phase A: selected drops DOWN behind the deck
    const DROP = 140; // px
    const selectedStartRank = getRank(targetIndex, activeIndex, plans.length);
    const selectedStartScale = STATES[selectedStartRank].scale;
    tl.to(
      selectedEl,
      {
        y: `+=${DROP}`,
        scale: Math.max(0.88, selectedStartScale - 0.04),
        zIndex: Math.min(5, STATES[selectedStartRank].z),
        duration: D.drop,
        ease: LINEAR,
      },
      0
    );

    // ---- Phase B: while it's down, move EVERY card to its new ranks
    cardRefs.current.forEach((wrapEl, i) => {
      if (!wrapEl || i === targetIndex) return;
      const rank = getRank(i, targetIndex, plans.length);
      const st = STATES[rank];

      tl.to(
        wrapEl,
        {
          y: st.y,
          scale: st.scale,
          zIndex: st.z,
          duration: D.reflow,
          ease: LINEAR,
          overwrite: true,
        },
        0.12 * SPEED // keep timing relationship, scaled
      );

      const cardEl = wrapEl.querySelector(".plan-card");
      if (cardEl) {
        tl.to(
          cardEl,
          { boxShadow: st.shadow, duration: D.reflow, ease: LINEAR },
          "<"
        );
      }
    });

    // ---- Phase C: selected comes FORWARD and UP to the front
    const front = STATES[0];
    const selectedContent = selectedEl.querySelector(".plan-card__content");

    tl.set(selectedEl, { zIndex: 100 }, 0.34 * SPEED);
    tl.to(
      selectedEl,
      { y: front.y - 10, scale: 1.02, duration: D.rise, ease: LINEAR },
      0.34 * SPEED
    );
    tl.to(
      selectedEl,
      { y: front.y, scale: 1, duration: D.settle, ease: LINEAR },
      ">-0.02"
    );

    if (selectedContent) {
      tl.fromTo(
        selectedContent,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: D.contentIn, ease: LINEAR },
        "-=0.18 * SPEED"
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

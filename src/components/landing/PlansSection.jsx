// src/components/landing/PlansSection.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import PlanCard from "./PlanCard";
import plansData from "./plans";

const SCROLL_FACTOR = 3000;
const EPS = 0.001;

// smoother start tuning
const START_LOCK_TOL = 24; // lock only when section top is near nav line
const MIN_VISIBLE_BELOW_NAV = 160; // require some section content under nav
const SMOOTH_SNAP_DIST = 140; // if snap distance is large, use smooth

export default function PlansSection({ plans = plansData }) {
  const sectionRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);
  const [viewportH, setViewportH] = useState(900);

  // 0..1 drives the whole deck
  const progress = useMotionValue(0);

  // lock refs
  const lockedRef = useRef(false);
  const lockTopRef = useRef(0);
  const snappingRef = useRef(false);
  const justLockedRef = useRef(false);

  const lastScrollYRef = useRef(0);
  const lastTouchYRef = useRef(null);

  const lastOutsideRef = useRef("above"); // 'above' | 'below'
  const cooldownRef = useRef(null); // 'down' | 'up' | null

  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight || 900);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getNavH = useCallback(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(
      "--nav-h",
    );
    const n = parseInt(v || "96", 10);
    return Number.isFinite(n) ? n : 96;
  }, []);

  const computeLockTop = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return window.scrollY || 0;

    const rect = el.getBoundingClientRect();
    const navH = getNavH();
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

    // lock so section sits right under the nav
    return scrollY + rect.top - navH;
  }, [getNavH]);

  const snapTo = useCallback((top, smooth = false) => {
    lockTopRef.current = top;
    snappingRef.current = true;

    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });

    requestAnimationFrame(() => {
      snappingRef.current = false;
    });
  }, []);

  const snapToLockTop = useCallback(
    (smooth = false) => {
      const top = computeLockTop();
      snapTo(top, smooth);
    },
    [computeLockTop, snapTo],
  );

  const computeRegion = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return "above";

    const rect = el.getBoundingClientRect();
    const navH = getNavH();
    const vpH = window.innerHeight || 900;

    if (rect.top >= vpH) return "above";
    if (rect.bottom <= navH) return "below";
    return "inside";
  }, [getNavH]);

  // lock only when section is basically aligned under nav
  const nearLockLine = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    const navH = getNavH();

    return (
      rect.top <= navH + START_LOCK_TOL &&
      rect.bottom >= navH + MIN_VISIBLE_BELOW_NAV
    );
  }, [getNavH]);

  // -----------------------------
  // INNER SCROLL (features list)
  // -----------------------------
  const getInnerScroller = useCallback((target) => {
    if (!(target instanceof Element)) return null;

    // Add more selectors if you have other scrollable areas inside cards
    const el = target.closest(".plan-card__features");
    if (!el) return null;

    const cs = window.getComputedStyle(el);
    const overflowY = cs.overflowY;
    const scrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 1;

    return scrollable ? el : null;
  }, []);

  const canConsumeScroll = useCallback((el, deltaY) => {
    if (!el) return false;

    const atTop = el.scrollTop <= 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    // deltaY > 0 = scroll down (forward)
    return deltaY > 0 ? !atBottom : !atTop;
  }, []);

  const shouldEngage = useCallback((forward) => {
    if (forward && cooldownRef.current === "down") return false;
    if (!forward && cooldownRef.current === "up") return false;
    return true;
  }, []);

  const engageLock = useCallback(
    (forward, smoothSnap = false) => {
      lockedRef.current = true;
      justLockedRef.current = true;

      // set correct start only when entering from outside
      const from = lastOutsideRef.current;
      if (forward && from === "above") progress.set(0);
      if (!forward && from === "below") progress.set(1);

      cooldownRef.current = null;
      snapToLockTop(smoothSnap);
    },
    [progress, snapToLockTop],
  );

  const disengageLock = useCallback((dir) => {
    lockedRef.current = false;
    justLockedRef.current = false;
    cooldownRef.current = dir; // 'down' or 'up'
  }, []);

  // click tab -> lock and animate progress to that card
  const focusTab = useCallback(
    (index) => {
      lockedRef.current = true;
      cooldownRef.current = null;
      justLockedRef.current = false;
      snapToLockTop(true);

      const seg = 1 / (plans.length + 1);
      const target = Math.min(1, (index + 0.52) * seg);

      animate(progress, target, {
        duration: 0.55,
        ease: [0.22, 0.68, 0.2, 0.99],
      });
    },
    [plans.length, progress, snapToLockTop],
  );

  // -----------------------------
  // WHEEL + TOUCH (deck scrub)
  // with inner-scroll priority
  // -----------------------------
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const onWheel = (e) => {
      if (!sectionRef.current) return;

      const forward = e.deltaY > 0;

      // If we're locked and the user is scrolling inside the features list,
      // and it can scroll further, consume it there (do NOT animate deck).
      const inner = getInnerScroller(e.target);
      if (lockedRef.current && inner && canConsumeScroll(inner, e.deltaY)) {
        e.preventDefault();
        inner.scrollTop += e.deltaY;
        window.scrollTo({ top: lockTopRef.current, behavior: "auto" });
        return;
      }

      // Not locked yet: lock only near the lock line (smooth start).
      // Also: if the event is on a scrollable inner list, let native scrolling happen.
      if (!lockedRef.current) {
        if (inner && canConsumeScroll(inner, e.deltaY)) return;
        if (!nearLockLine()) return;
        if (!shouldEngage(forward)) return;

        engageLock(forward, false);
        e.preventDefault();
        return;
      }

      // First tick after lock: keep pinned but don't scrub yet.
      if (justLockedRef.current) {
        justLockedRef.current = false;
        e.preventDefault();
        window.scrollTo({ top: lockTopRef.current, behavior: "auto" });
        return;
      }

      const v = progress.get();
      const atStart = v <= EPS;
      const atEnd = v >= 1 - EPS;

      // allow leaving once animation is done in that direction
      if (atEnd && forward) return disengageLock("down");
      if (atStart && !forward) return disengageLock("up");

      e.preventDefault();

      const delta = Math.max(-80, Math.min(80, e.deltaY));
      progress.set(clamp01(v + delta / SCROLL_FACTOR));
      window.scrollTo({ top: lockTopRef.current, behavior: "auto" });
    };

    const onTouchStart = (e) => {
      lastTouchYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!sectionRef.current) return;

      const y = e.touches[0].clientY;
      const last = lastTouchYRef.current;
      const dy = last == null ? 0 : last - y; // swipe up => forward
      lastTouchYRef.current = y;

      const forward = dy > 0;

      // Inner-scroll priority while locked
      const inner = getInnerScroller(e.target);
      if (lockedRef.current && inner && canConsumeScroll(inner, dy)) {
        e.preventDefault();
        inner.scrollTop += dy;
        window.scrollTo({ top: lockTopRef.current, behavior: "auto" });
        return;
      }

      // Not locked yet: if user is scrolling inside inner list, let it scroll naturally
      if (!lockedRef.current) {
        if (inner && canConsumeScroll(inner, dy)) return;
        if (!nearLockLine()) return;
        if (!shouldEngage(forward)) return;

        engageLock(forward, false);
        e.preventDefault();
        return;
      }

      if (justLockedRef.current) {
        justLockedRef.current = false;
        e.preventDefault();
        window.scrollTo({ top: lockTopRef.current, behavior: "auto" });
        return;
      }

      const v = progress.get();
      const atStart = v <= EPS;
      const atEnd = v >= 1 - EPS;

      if (atEnd && forward) return disengageLock("down");
      if (atStart && !forward) return disengageLock("up");

      e.preventDefault();
      progress.set(clamp01(v + dy / (SCROLL_FACTOR * 0.9)));
      window.scrollTo({ top: lockTopRef.current, behavior: "auto" });
    };

    const onTouchEnd = () => {
      lastTouchYRef.current = null;
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
  }, [
    progress,
    nearLockLine,
    shouldEngage,
    engageLock,
    disengageLock,
    getInnerScroller,
    canConsumeScroll,
  ]);

  // momentum safety net (fast flick skip + keep pin)
  useEffect(() => {
    lastScrollYRef.current =
      window.scrollY || document.documentElement.scrollTop || 0;

    const onScroll = () => {
      if (snappingRef.current) return;

      const el = sectionRef.current;
      if (!el) return;

      const curY = window.scrollY || document.documentElement.scrollTop || 0;
      const prevY = lastScrollYRef.current;
      const goingDown = curY > prevY;
      lastScrollYRef.current = curY;

      // update outside side + clear cooldown once we truly leave
      const region = computeRegion();
      if (region !== "inside") {
        lastOutsideRef.current = region; // 'above' | 'below'
        cooldownRef.current = null;
      }

      // while locked: keep pinned (no drift)
      if (lockedRef.current) {
        const lockTop = computeLockTop();
        lockTopRef.current = lockTop;
        if (Math.abs(curY - lockTop) > 1) snapTo(lockTop, false);
        return;
      }

      // if momentum crosses the lock line, engage (smooth snap if big correction)
      const lockTop = computeLockTop();
      const crossed =
        (prevY < lockTop && curY >= lockTop) ||
        (prevY > lockTop && curY <= lockTop);

      if (!crossed) return;
      if (!shouldEngage(goingDown)) return;

      const dist = Math.abs(curY - lockTop);
      const smooth = dist > SMOOTH_SNAP_DIST;

      engageLock(goingDown, smooth);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [computeRegion, computeLockTop, snapTo, shouldEngage, engageLock]);

  // active tab highlight driven by progress (kept as-is)
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

  const outY = -Math.max(320, Math.round(viewportH * 0.8));

  const y = useTransform(
    progress,
    [0, start, mid, end, 1],
    [baseY, baseY, 0, outY, outY],
  );
  const scale = useTransform(
    progress,
    [0, start, mid, end, 1],
    [baseScale, baseScale, 1, 1, 1],
  );
  const zIndex = useTransform(
    progress,
    [0, start, mid, end, 1],
    [20 - index, 20 - index, 60, 0, 0],
  );

  return (
    <motion.div className="plans__deck-card" style={{ y, scale, zIndex }}>
      <PlanCard plan={plan} />
    </motion.div>
  );
}

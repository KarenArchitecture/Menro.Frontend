// src/components/landing/PlansSection.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import PlanCard from "./PlanCard";
import plansData from "./plans";

const SCROLL_FACTOR = 4200;
const SCROLLBAR_FACTOR = 9000;
const EPS = 0.001;

// smoother start tuning
const START_LOCK_TOL = 24;
const MIN_VISIBLE_BELOW_NAV = 160;

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export default function PlansSection({ plans = plansData }) {
  const sectionRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);
  const [viewportH, setViewportH] = useState(900);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });

  // 0..1 drives the desktop deck
  const progress = useMotionValue(0);

  // lock refs
  const lockedRef = useRef(false);
  const lockTopRef = useRef(0);
  const snappingRef = useRef(false);
  const justLockedRef = useRef(false);

  const lastScrollYRef = useRef(0);
  const lastTouchYRef = useRef(null);

  const lastOutsideRef = useRef("above");
  const cooldownRef = useRef(null);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");

    const update = () => {
      setIsMobile(mql.matches);

      if (mql.matches) {
        lockedRef.current = false;
        snappingRef.current = false;
        justLockedRef.current = false;
        cooldownRef.current = null;
        progress.set(0);
      }
    };

    update();

    if (mql.addEventListener) {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    mql.addListener(update);
    return () => mql.removeListener(update);
  }, [progress]);

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

    return scrollY + rect.top - navH;
  }, [getNavH]);

  const snapTo = useCallback((top, smooth = false) => {
    lockTopRef.current = top;
    snappingRef.current = true;

    window.scrollTo({
      top,
      behavior: smooth ? "smooth" : "auto",
    });

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

  const getInnerScroller = useCallback((target) => {
    if (!(target instanceof Element)) return null;

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
    cooldownRef.current = dir;
  }, []);

  const focusTab = useCallback(
    (index) => {
      if (isMobile) {
        setActiveStep(index);
        return;
      }

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
    [isMobile, plans.length, progress, snapToLockTop],
  );

  useEffect(() => {
    if (isMobile) return;

    const el = sectionRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (!sectionRef.current) return;

      const forward = e.deltaY > 0;

      const inner = getInnerScroller(e.target);

      if (lockedRef.current && inner && canConsumeScroll(inner, e.deltaY)) {
        e.preventDefault();
        inner.scrollTop += e.deltaY;
        window.scrollTo({ top: lockTopRef.current, behavior: "auto" });
        return;
      }

      if (!lockedRef.current) {
        if (inner && canConsumeScroll(inner, e.deltaY)) return;
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

      if (atEnd && forward) {
        disengageLock("down");
        return;
      }

      if (atStart && !forward) {
        disengageLock("up");
        return;
      }

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
      const dy = last == null ? 0 : last - y;

      lastTouchYRef.current = y;

      const forward = dy > 0;

      const inner = getInnerScroller(e.target);

      if (lockedRef.current && inner && canConsumeScroll(inner, dy)) {
        e.preventDefault();
        inner.scrollTop += dy;
        window.scrollTo({ top: lockTopRef.current, behavior: "auto" });
        return;
      }

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

      if (atEnd && forward) {
        disengageLock("down");
        return;
      }

      if (atStart && !forward) {
        disengageLock("up");
        return;
      }

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
    isMobile,
    progress,
    nearLockLine,
    shouldEngage,
    engageLock,
    disengageLock,
    getInnerScroller,
    canConsumeScroll,
  ]);

  useEffect(() => {
    if (isMobile) return;

    lastScrollYRef.current =
      window.scrollY || document.documentElement.scrollTop || 0;

    const onScroll = () => {
      if (snappingRef.current) return;

      const el = sectionRef.current;
      if (!el) return;

      const curY = window.scrollY || document.documentElement.scrollTop || 0;
      const prevY = lastScrollYRef.current;
      const goingDown = curY > prevY;

      const lockTop = computeLockTop();

      /**
       * Keep this before updating lastScrollYRef.
       * This lets scrollbar dragging trigger the lock even if it jumps.
       */
      const crossedLockLine =
        (prevY < lockTop && curY >= lockTop) ||
        (prevY > lockTop && curY <= lockTop);

      lastScrollYRef.current = curY;

      const region = computeRegion();

      if (region !== "inside") {
        lastOutsideRef.current = region;
        cooldownRef.current = null;
      }

      /**
       * CASE 1:
       * Already locked.
       * Scrollbar drag tries to move the page away from lockTop.
       * Convert that attempted movement into animation progress.
       */
      if (lockedRef.current) {
        lockTopRef.current = lockTop;

        const attemptedDelta = curY - lockTop;

        if (Math.abs(attemptedDelta) > 1) {
          const forward = attemptedDelta > 0;

          const v = progress.get();
          const atStart = v <= EPS;
          const atEnd = v >= 1 - EPS;

          if (atEnd && forward) {
            disengageLock("down");
            return;
          }

          if (atStart && !forward) {
            disengageLock("up");
            return;
          }

          const delta = Math.max(-120, Math.min(120, attemptedDelta));

          progress.set(clamp01(v + delta / SCROLLBAR_FACTOR));

          lastScrollYRef.current = lockTop;
          snapTo(lockTop, false);
        }

        return;
      }

      /**
       * CASE 2:
       * Not locked yet.
       * Mouse wheel enters through the wheel handler.
       * Scrollbar dragging enters through this scroll handler.
       */
      const shouldStartFromScrollbar = crossedLockLine || nearLockLine();

      if (!shouldStartFromScrollbar) return;
      if (!shouldEngage(goingDown)) return;

      lockedRef.current = true;
      justLockedRef.current = true;
      cooldownRef.current = null;

      if (goingDown) {
        progress.set(0);
      } else {
        progress.set(1);
      }

      lockTopRef.current = lockTop;
      lastScrollYRef.current = lockTop;

      /**
       * Do not smooth snap here.
       * Smooth snap can let the scrollbar skip the locked state.
       */
      snapTo(lockTop, false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [
    isMobile,
    progress,
    computeRegion,
    computeLockTop,
    nearLockLine,
    snapTo,
    shouldEngage,
    disengageLock,
  ]);

  useEffect(() => {
    if (isMobile) return;

    const total = plans.length || 1;

    return progress.on("change", (v) => {
      const seg = 1 / (total + 1);
      let cur = 0;

      for (let i = 0; i < total; i++) {
        if (v >= (i + 0.5) * seg) cur = i;
      }

      setActiveStep(cur);
    });
  }, [isMobile, plans, progress]);

  const activePlan = plans[activeStep] ?? plans[0];

  if (isMobile) {
    return (
      <section
        ref={sectionRef}
        className="plans-pin plans-pin--mobile"
        aria-labelledby="plans-title"
      >
        <div className="plans-pin__sticky plans-pin__sticky--mobile">
          <div className="plans__tabs" role="tablist" aria-label="انتخاب پلن">
            {plans.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={i === activeStep}
                className={`plans__tab ${i === activeStep ? "is-active" : ""}`}
                type="button"
                onClick={() => setActiveStep(i)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <h2 id="plans-title" className="sr-only">
            پلن‌های منرو
          </h2>

          <div className="plans__deck plans__deck--mobile">
            <div
              className="plans__mobile-stack plans__mobile-stack--1"
              aria-hidden="true"
              style={{
                backgroundImage: activePlan?.bgSrc
                  ? `url(${activePlan.bgSrc})`
                  : undefined,
              }}
            />
            <div
              className="plans__mobile-stack plans__mobile-stack--2"
              aria-hidden="true"
              style={{
                backgroundImage: activePlan?.bgSrc
                  ? `url(${activePlan.bgSrc})`
                  : undefined,
              }}
            />
            <div
              className="plans__mobile-stack plans__mobile-stack--3"
              aria-hidden="true"
              style={{
                backgroundImage: activePlan?.bgSrc
                  ? `url(${activePlan.bgSrc})`
                  : undefined,
              }}
            />

            <PlanCard plan={activePlan} />
          </div>
        </div>
      </section>
    );
  }

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

  // Make outY much higher to ensure it fully leaves the screen
  const outY = -(viewportH * 1.5);

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

  // Keep zIndex high at the end (60 instead of 0) so it passes IN FRONT of the tabs/header
  const zIndex = useTransform(
    progress,
    [0, start, mid, end, 1],
    [20 - index, 20 - index, 60, 60, 60],
  );

  return (
    <motion.div className="plans__deck-card" style={{ y, scale, zIndex }}>
      <PlanCard plan={plan} />
    </motion.div>
  );
}

// components/landing/BurgerPanelSection.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
} from "motion/react";

export default function BurgerPanelSection({
  title = "با منرو تو چشم باش",
  burgerSrc = "/images/burger-landing.png",
  burgerAlt = "برگر سه‌بعدی منرو",
  meshSrc = "",
  haloSrc = "/images/burger-blur.png",
}) {
  const sectionRef = useRef(null);
  const sceneRef = useRef(null);
  const burgerRef = useRef(null);

  // ==========================================
  // === THE FIX: SAFE AUTO-DETECT SCROLLER ===
  // ==========================================
  const [scrollElement, setScrollElement] = useState(null);
  const customScrollRef = useRef(null);

  useEffect(() => {
    const checkScrollContainer = () => {
      const container = document.querySelector(".app-shell__content");
      if (container) {
        // Evaluate CSS *after* the DOM is fully painted
        const styles = window.getComputedStyle(container);
        if (styles.overflowY === "auto" || styles.overflowY === "scroll") {
          setScrollElement(container);
          return;
        }
      }
      setScrollElement(null);
    };

    // Run on mount
    checkScrollContainer();

    // Re-evaluate if the user resizes the screen (e.g., rotating phone)
    window.addEventListener("resize", checkScrollContainer);
    return () => window.removeEventListener("resize", checkScrollContainer);
  }, []);

  // Keep the Ref in sync with the detected element
  customScrollRef.current = scrollElement;

  const scrollConfig = {
    target: sectionRef,
    // Only pass the container if we found a scrollable one
    ...(scrollElement ? { container: customScrollRef } : {}),
  };
  // ==========================================

  // ===== Burger animation =====
  const { scrollYProgress } = useScroll({
    ...scrollConfig,
    offset: ["start 90%", "end 10%"],
  });

  const burgerOpacity = useTransform(
    scrollYProgress,
    [0.0, 0.06, 0.85, 0.95],
    [0, 1, 1, 0],
  );

  const burgerY = useTransform(
    scrollYProgress,
    [0.06, 0.55],
    ["0vh", "-120vh"],
  );

  // ===== Panel & Wrapper: simulated sticky + smooth fade + de-tilt =====
  const { scrollYProgress: sectionProg } = useScroll({
    ...scrollConfig,
    offset: ["start start", "end end"],
  });

  // Simulated Sticky: translates the wrapper down exactly as the user scrolls up
  const wrapperY = useTransform(sectionProg, [0, 1], ["0vh", "200vh"]);

  const panelOpacity = useTransform(
    sectionProg,
    [0.0, 0.04, 0.96, 1.0],
    [0, 1, 1, 0],
  );

  const panelRotateX = useTransform(
    sectionProg,
    [0, 0.15, 0.55, 0.9, 1],
    ["20deg", "10deg", "0deg", "0deg", "0deg"],
  );

  const panelTransform = useMotionTemplate`
    perspective(700px) translate3d(-50%, -50%, 0) rotateX(${panelRotateX})
  `;

  // Mount logic to avoid mount pop
  const [active, setActive] = useState(false);

  useMotionValueEvent(sectionProg, "change", (v) => {
    const on = v > -0.02 && v < 1.02;
    setActive((prev) => (prev !== on ? on : prev));
  });

  // ===== Title animation =====
  const titleOpacityIn = useTransform(scrollYProgress, [0.04, 0.12], [0, 1]);

  const titleY = useTransform(scrollYProgress, [0.06, 0.55], ["-42vh", "0vh"]);

  const titleOpacityOut = useTransform(sectionProg, [0.85, 0.95], [1, 0]);

  const titleOpacity = useTransform(
    [titleOpacityIn, titleOpacityOut],
    ([a, b]) => a * b,
  );

  const PanelOverlay = (
    <motion.div
      className="bp__panel"
      style={{
        transform: panelTransform,
        opacity: panelOpacity,
      }}
    >
      {meshSrc && (
        <div
          className="bp__mesh"
          style={{ backgroundImage: `url(${meshSrc})` }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );

  return (
    <section ref={sectionRef} className="bp" style={{ height: "300vh" }}>
      {/* 
        NEW: Simulated Sticky Wrapper
        Uses position: relative and translates dynamically via Framer Motion 
        to bypass CSS overflow conflicts. 
      */}
      <motion.div
        className="bp__sticky-wrapper"
        style={{
          position: "relative",
          height: "100vh",
          overflow: "hidden",
          y: wrapperY,
        }}
      >
        <motion.h2 className="bp__title" style={{ opacity: panelOpacity }}>
          {title}
        </motion.h2>

        <div
          ref={sceneRef}
          className="bp__scene"
          style={{ position: "relative", zIndex: 100 }}
        >
          <div className="bp__stage">
            <motion.div
              ref={burgerRef}
              className="bp__burger"
              style={{ opacity: burgerOpacity, y: burgerY }}
            >
              {haloSrc ? (
                <img
                  className="bp__glow"
                  src={haloSrc}
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <div className="bp__glow" aria-hidden="true" />
              )}
              <img className="bp__burgerImg" src={burgerSrc} alt={burgerAlt} />
            </motion.div>

            {/* Render the panel directly here */}
            {active && PanelOverlay}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

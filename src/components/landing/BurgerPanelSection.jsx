// components/landing/BurgerPanelSection.jsx
import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
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

  // ===== Burger animation =====
  const { scrollYProgress } = useScroll({
    target: sectionRef,
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

  // ===== Panel: portal + fixed + smooth fade + de-tilt =====
  const { scrollYProgress: sectionProg } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

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

  // Mount into portal slightly before/after to avoid mount pop
  const [active, setActive] = useState(false);
  useMotionValueEvent(sectionProg, "change", (v) => {
    const on = v > -0.02 && v < 1.02;
    setActive((prev) => (prev !== on ? on : prev));
  });

  // ===== Title: "from behind burger" + settle on panel =====
  // Fade in shortly after burger appears (tied to burger progress)
  const titleOpacityIn = useTransform(scrollYProgress, [0.06, 0.14], [0, 1]);

  // Start higher and settle down as burger goes up (tied to burger travel window)
  const titleYPercentIn = useTransform(scrollYProgress, [0.06, 0.55], [-60, 0]);

  // Fade out near end of section (keep your original section-based exit)
  const titleOpacityOut = useTransform(sectionProg, [0.85, 0.95], [1, 0]);

  // Combine opacities so it must be "in" AND not yet "out"
  const titleOpacity = useTransform(
    [titleOpacityIn, titleOpacityOut],
    ([a, b]) => a * b,
  );

  const titleTransform = useMotionTemplate`translateY(${titleYPercentIn}%)`;

  const PanelOverlay = (
    <motion.div
      className="bp__panel"
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: panelTransform,
        transformOrigin: "0 100%",
        willChange: "transform, opacity",
        opacity: panelOpacity,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {meshSrc && (
        <div
          className="bp__mesh"
          style={{ backgroundImage: `url(${meshSrc})` }}
          aria-hidden="true"
        />
      )}

      {/* Title is behind burger via CSS z-index tweak (bp__title lower than bp__burger) */}
      <motion.h2
        className="bp__title"
        style={{ opacity: titleOpacity, transform: titleTransform }}
      >
        {title}
      </motion.h2>
    </motion.div>
  );

  return (
    <section ref={sectionRef} className="bp">
      <div ref={sceneRef} className="bp__scene">
        <div className="bp__stage">
          {/* Burger */}
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

          {/* Portal the panel so it's truly fixed to the viewport */}
          {active &&
            typeof document !== "undefined" &&
            createPortal(PanelOverlay, document.body)}
        </div>
      </div>
    </section>
  );
}

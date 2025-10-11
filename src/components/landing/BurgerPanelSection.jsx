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

  // ------ Burger animation (unchanged) ------
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 90%", "end 10%"],
  });
  const opacity = useTransform(
    scrollYProgress,
    [0.0, 0.06, 0.85, 0.95],
    [0, 1, 1, 0]
  );
  const y = useTransform(scrollYProgress, [0.06, 0.55], ["0vh", "-120vh"]);

  // ------ Panel: portal + fixed to viewport ------
  const { scrollYProgress: sectionProg } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"], // 0 at section top, 1 at section bottom
  });

  // de-tilt across the section
  const rotateX = useTransform(sectionProg, [0, 1], ["26deg", "0deg"]);
  const transform = useMotionTemplate`translate(-50%, -50%) rotateX(${rotateX})`;

  // toggle portal when inside section (attach to viewport)
  const [active, setActive] = useState(false);
  useMotionValueEvent(sectionProg, "change", (v) => {
    const on = v > 0 && v < 1;
    setActive((prev) => (prev !== on ? on : prev));
  });

  // The fixed panel element we portal to <body>
  const PanelOverlay = (
    <motion.div
      className="bp__panel"
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform,
        transformOrigin: "50% 100%",
        willChange: "transform",
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
      <h2 className="bp__title">{title}</h2>
    </motion.div>
  );

  return (
    <section ref={sectionRef} className="bp">
      <div ref={sceneRef} className="bp__scene">
        <div className="bp__stage">
          {/* Burger stays in flow */}
          <motion.div
            ref={burgerRef}
            className="bp__burger"
            style={{ opacity, y }}
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

          {/* We keep a non-fixed placeholder to maintain layout height if needed (optional) */}
          <div style={{ width: 1, height: 1, visibility: "hidden" }} />

          {/* Render fixed panel INTO <body> only while inside the section */}
          {active &&
            typeof document !== "undefined" &&
            createPortal(PanelOverlay, document.body)}
        </div>
      </div>
    </section>
  );
}

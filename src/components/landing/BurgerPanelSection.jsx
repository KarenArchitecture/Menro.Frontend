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

  // ===== Title animation =====
  // Starts above the panel/frame and settles into exact center.
  // Burger remains in front and moves upward with its existing animation.

  const titleOpacityIn = useTransform(scrollYProgress, [0.04, 0.12], [0, 1]);

  // const titleY = useTransform(scrollYProgress, [0.06, 0.55], ["-42vh", "0vh"]);

  const titleOpacityOut = useTransform(sectionProg, [0.85, 0.95], [1, 0]);
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.12, 0.75, 0.8, 1],
    [0, 0, 1, 1, 0, 0],
  );
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
    </motion.div>
  );

  return (
    <section ref={sectionRef} className="bp">
      <div ref={sceneRef} className="bp__scene">
        <div className="bp__stage">
          <motion.div
            ref={burgerRef}
            className="bp__burger"
            style={{
              opacity: burgerOpacity,
              y: burgerY,
            }}
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

          {active &&
            typeof document !== "undefined" &&
            createPortal(PanelOverlay, document.body)}
        </div>
      </div>
      <motion.h2
        className="bp__title"
        style={{
          opacity: titleOpacity,
          // y: titleY,
          zIndex: 2,
        }}
      >
        {title}
      </motion.h2>
    </section>
  );
}

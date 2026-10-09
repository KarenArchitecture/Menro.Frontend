// components/landing/BurgerPanelSection.jsx
import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
} from "motion/react";

/* ------------------------------------------------------------------ */
/* Timeline (all numbers here are tunable)                             */
/* ------------------------------------------------------------------ */
//
// "S" below means: how many viewport-heights the user has scrolled since the
// top of this section reached the top of the screen. S = 0 is the moment the
// section starts to pin; S = 100 is one full screen later.
//
//   burger : rises from below the screen, crosses the frame, leaves at the top
//   title  : slowly descends and fades in WHILE the burger passes in front
//   panel  : the frame de-tilts over the same stretch, so everything moves
//            together and nothing "sits still" while something else adjusts
//
const SECTION_VH = 300; // total height of the section
const SCROLL_VH = SECTION_VH - 100; // how far you scroll while it is pinned
const toProgress = (s) => s / SCROLL_VH; // S (vh) -> 0..1 progress

// Burger path: [S, where the burger's CENTER is on screen, in vh]
// 0 = top of the screen, 50 = middle, 100 = bottom edge, >100 = below the screen
const BURGER_PATH = [
  [8, 138], // waiting just below the screen
  [34, 96], // slowly coming into view
  [66, 38], // crossing the frame, passing in front of the title
  [100, -50], // completely above the screen
];
const BURGER_FADE_IN = [8, 24];
// The burger (and its glow) is fully gone by S = 96, BEFORE the title settles
const BURGER_FADE_OUT = [76, 96];

// Glow size, as a multiple of the burger's width
const HALO_SCALE = 1.9;

// Title: descends from TITLE_START_Y (vh above its final spot) to 0.
// It settles AFTER the burger has left, so you see it finish moving on its own.
const TITLE_MOVE = [6, 112];
const TITLE_START_Y = -42;

// Where the title rests: its bottom edge sits this many px ABOVE the frame.
// Raise it to lift the title higher, lower it to bring it closer to the frame.
const TITLE_GAP_PX = 24;

// Title fade-in: [S, opacity]. The slow start (0 -> 0.18 over 24 vh of scroll)
// keeps it faint while the burger passes, then it reaches full opacity
// right as the burger leaves (S = 98).
const TITLE_FADE = [
  [34, 0],
  [58, 0.18],
  [98, 1],
];

// The frame finishes tilting at the same time the title finishes descending
const PANEL_SETTLE = TITLE_MOVE[1];

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

  const [scrollElement, setScrollElement] = useState(null);
  const customScrollRef = useRef(null);

  // controls whether title/panel are pinned or not
  const [isPinned, setIsPinned] = useState(false);

  // if the halo image fails to load, a CSS gradient glow is used instead
  const [haloFailed, setHaloFailed] = useState(false);

  // The frame's real height (it changes with screen size via CSS). The title
  // is anchored to the frame's top edge, so it always rests just above it.
  const panelRef = useRef(null);
  const [panelH, setPanelH] = useState(610);

  useLayoutEffect(() => {
    if (!isPinned) return;

    const measure = () => {
      if (panelRef.current) setPanelH(panelRef.current.offsetHeight);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isPinned]);

  useEffect(() => {
    const checkScrollContainer = () => {
      const container = document.querySelector(".app-shell__content");
      if (container) {
        const styles = window.getComputedStyle(container);
        if (styles.overflowY === "auto" || styles.overflowY === "scroll") {
          setScrollElement(container);
          return;
        }
      }
      setScrollElement(null);
    };

    checkScrollContainer();
    window.addEventListener("resize", checkScrollContainer);
    return () => window.removeEventListener("resize", checkScrollContainer);
  }, []);

  customScrollRef.current = scrollElement;

  const scrollConfig = {
    target: sectionRef,
    ...(scrollElement ? { container: customScrollRef } : {}),
  };

  // One progress value drives everything:
  // 0 when the section top reaches the top of the screen,
  // 1 when the section bottom reaches the bottom of the screen.
  const { scrollYProgress: sectionProg } = useScroll({
    ...scrollConfig,
    offset: ["start start", "end end"],
  });

  // ===== Burger (and its glow, which lives inside the same element) =====
  //
  // The burger sits in normal page flow, so it scrolls up with the page on its
  // own. To place it exactly where BURGER_PATH says, we add an offset that
  // cancels the page scroll:  y = wantedCenter - 50 + S
  const burgerY = useTransform(
    sectionProg,
    BURGER_PATH.map(([s]) => toProgress(s)),
    BURGER_PATH.map(([s, center]) => `${(center - 50 + s).toFixed(2)}vh`),
  );

  const burgerOpacity = useTransform(
    sectionProg,
    [
      toProgress(BURGER_FADE_IN[0]),
      toProgress(BURGER_FADE_IN[1]),
      toProgress(BURGER_FADE_OUT[0]),
      toProgress(BURGER_FADE_OUT[1]),
    ],
    [0, 1, 1, 0],
  );

  // ===== Panel =====
  const panelOpacity = useTransform(
    sectionProg,
    [0.0, 0.04, 0.985, 1.0],
    [0, 1, 1, 0],
  );

  const panelRotateX = useTransform(
    sectionProg,
    [0, toProgress(PANEL_SETTLE * 0.4), toProgress(PANEL_SETTLE)],
    ["20deg", "10deg", "0deg"],
  );

  const panelTransform = useMotionTemplate`
    perspective(700px) translate3d(-50%, -50%, 0) rotateX(${panelRotateX})
  `;

  // pin only while the section is in its active window
  useMotionValueEvent(sectionProg, "change", (v) => {
    const on = v > 0.03 && v < 0.99;
    setIsPinned((prev) => (prev === on ? prev : on));
  });

  // ===== Title =====
  const titleY = useTransform(
    sectionProg,
    [toProgress(TITLE_MOVE[0]), toProgress(TITLE_MOVE[1])],
    [`${TITLE_START_Y}vh`, "0vh"],
  );

  const titleOpacityIn = useTransform(
    sectionProg,
    TITLE_FADE.map(([s]) => toProgress(s)),
    TITLE_FADE.map(([, o]) => o),
  );

  const titleOpacityOut = useTransform(sectionProg, [0.93, 0.985], [1, 0]);

  const titleOpacity = useTransform(
    [titleOpacityIn, titleOpacityOut],
    ([a, b]) => a * b,
  );

  const PanelOverlay = (
    <motion.div
      ref={panelRef}
      className={`bp__panel ${isPinned ? "is-fixed" : "is-off"}`}
      style={{
        position: isPinned ? "fixed" : "absolute",
        left: "50%",
        top: "60%",
        transform: panelTransform,
        transformOrigin: "0 100%",
        willChange: "transform, opacity",
        opacity: panelOpacity,
        zIndex: 10,
        pointerEvents: "none",
        visibility: isPinned ? "visible" : "hidden",
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

  // Glow layer: always centered on the burger, always behind it.
  const haloBaseStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: `${HALO_SCALE * 100}%`,
    aspectRatio: "1 / 1",
    translate: "-50% -50%",
    zIndex: 0, // behind the burger image (which is zIndex 1)
    pointerEvents: "none",
  };

  const showImageHalo = Boolean(haloSrc) && !haloFailed;

  return (
    <section
      ref={sectionRef}
      className="bp"
      style={{ height: `${SECTION_VH}vh` }}
    >
      <motion.h2
        className={`bp__title ${isPinned ? "is-fixed" : "is-off"}`}
        style={{
          position: isPinned ? "fixed" : "absolute",
          // Anchor the title's bottom edge to the frame's top edge.
          // The frame is centered at 60% of the screen height, so its top edge
          // is 40% + half its height up from the bottom of the screen.
          top: "auto",
          bottom: `calc(40% + ${panelH / 2}px + ${TITLE_GAP_PX}px)`,
          y: titleY,
          zIndex: 60,
          opacity: titleOpacity,
          pointerEvents: "none",
          visibility: isPinned ? "visible" : "hidden",
        }}
      >
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
            style={{
              opacity: burgerOpacity,
              y: burgerY,
            }}
          >
            {/* Glow (behind the burger, moves and fades with it) */}
            {showImageHalo ? (
              <img
                src={haloSrc}
                alt=""
                aria-hidden="true"
                draggable="false"
                onError={() => setHaloFailed(true)}
                style={{ ...haloBaseStyle, objectFit: "contain", opacity: 0.9 }}
              />
            ) : (
              <div
                aria-hidden="true"
                style={{
                  ...haloBaseStyle,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,109,26,0.45) 0%, rgba(255,109,26,0.18) 32%, rgba(255,109,26,0) 65%)",
                }}
              />
            )}

            <img
              className="bp__burgerImg"
              src={burgerSrc}
              alt={burgerAlt}
              style={{ position: "relative", zIndex: 1 }}
            />
          </motion.div>

          {isPinned &&
            typeof document !== "undefined" &&
            createPortal(PanelOverlay, document.body)}
        </div>
      </div>
    </section>
  );
}
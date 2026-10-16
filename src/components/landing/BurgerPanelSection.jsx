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

const SECTION_VH = 300;
const SCROLL_VH = SECTION_VH - 100;
const toProgress = (s) => s / SCROLL_VH;

const BURGER_PATH = [
  [8, 138],
  [34, 96],
  [66, 38],
  [100, -50],
];
const BURGER_FADE_IN = [8, 24];
const BURGER_FADE_OUT = [76, 96];

const HALO_SCALE = 1.9;

const TITLE_MOVE = [6, 112];
const TITLE_START_Y = -42;

const TITLE_FADE = [
  [34, 0],
  [58, 0.18],
  [98, 1],
];

const PANEL_SETTLE = TITLE_MOVE[1];

/* ------------------------------------------------------------------ */
/* Desktop layout (screens wider than a tablet)                        */
/* ------------------------------------------------------------------ */
// Final resting layout, top to bottom:
//   [ header ] -- TOP_GAP -- [ title ] -- TITLE_GAP -- [ frame ] -- BOTTOM_MARGIN
// The title+frame block is centered in the free space under the header,
// and the frame shrinks (down to PANEL_MIN_H) if the screen is short.
const DESKTOP_MIN_WIDTH = 1025;
const HEADER_SELECTOR = ".landing-desktop-header";
const HEADER_FALLBACK_PX = 125;
const TOP_GAP_PX = 6; // header -> title
const TITLE_GAP_PX = 6; // title  -> frame
const BOTTOM_MARGIN_PX = 16; // frame  -> bottom of screen
const SIDE_MARGIN_PX = 40;
const PANEL_MIN_H = 340;
const PANEL_MAX_W = 1240;
const PANEL_ASPECT = 1.7; // width / height
const panelMaxH = (w) => (w <= 1280 ? 600 : 740);

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
  const titleRef = useRef(null);

  const [scrollElement, setScrollElement] = useState(null);
  const customScrollRef = useRef(null);

  const [isPinned, setIsPinned] = useState(false);
  const [haloFailed, setHaloFailed] = useState(false);

  // Tablet/mobile fallback (old behaviour): measured frame height
  const panelRef = useRef(null);
  const [panelH, setPanelH] = useState(610);

  // Desktop layout: { panelH, panelCenter, titleTop } in px, or null
  const [layout, setLayout] = useState(null);

  useLayoutEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // ---- tablet / mobile: keep old behaviour ----
      if (vw < DESKTOP_MIN_WIDTH) {
        setLayout(null);
        if (panelRef.current) setPanelH(panelRef.current.offsetHeight);
        return;
      }

      // ---- desktop ----
      const headerEl = document.querySelector(HEADER_SELECTOR);
      const rawBottom = headerEl
        ? headerEl.getBoundingClientRect().bottom
        : HEADER_FALLBACK_PX;
      // safety clamp so a weird match can never eat the whole screen
      const headerBottom = Math.min(Math.max(rawBottom, 0), vh * 0.3);

      const titleH = titleRef.current ? titleRef.current.offsetHeight : 90;

      const regionTop = headerBottom + TOP_GAP_PX;
      const regionBottom = vh - BOTTOM_MARGIN_PX;
      const regionH = regionBottom - regionTop;

      const availableForPanel = regionH - titleH - TITLE_GAP_PX;
      const nextPanelH = Math.round(
        Math.min(
          panelMaxH(vw),
          Math.max(PANEL_MIN_H, availableForPanel),
        ),
      );

      const nextPanelW = Math.round(
        Math.min(nextPanelH * PANEL_ASPECT, PANEL_MAX_W, vw - SIDE_MARGIN_PX * 2),
      );

      const blockH = titleH + TITLE_GAP_PX + nextPanelH;
      const blockTop = regionTop + Math.max(0, (regionH - blockH) / 2);

      const titleTop = Math.round(blockTop);
      const panelTop = blockTop + titleH + TITLE_GAP_PX;
      const panelCenter = Math.round(panelTop + nextPanelH / 2);

      setLayout((prev) =>
        prev &&
          prev.panelH === nextPanelH &&
          prev.panelW === nextPanelW &&
          prev.panelCenter === panelCenter &&
          prev.titleTop === titleTop
          ? prev
          : { panelH: nextPanelH, panelW: nextPanelW, panelCenter, titleTop },
      );
    };

    compute();
    window.addEventListener("resize", compute);
    // the title height changes once the web font is loaded
    document.fonts?.ready?.then(compute);

    return () => window.removeEventListener("resize", compute);
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

  const { scrollYProgress: sectionProg } = useScroll({
    ...scrollConfig,
    offset: ["start start", "end end"],
  });

  // ===== Burger =====
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
        // desktop: exact pixel position from the layout; otherwise old 60%
        top: layout ? `${layout.panelCenter}px` : "60%",
        ...(layout
          ? { height: `${layout.panelH}px`, width: `${layout.panelW}px` }
          : {}),
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

  const haloBaseStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: `${HALO_SCALE * 100}%`,
    aspectRatio: "1 / 1",
    translate: "-50% -50%",
    zIndex: 0,
    pointerEvents: "none",
  };

  const showImageHalo = Boolean(haloSrc) && !haloFailed;

  // Title position: desktop = exact top from the layout (between header and
  // frame); tablet/mobile = old "anchored above the frame" formula.
  const titlePositionStyle = layout
    ? { top: `${layout.titleTop}px`, bottom: "auto" }
    : {
      top: "auto",
      bottom: `calc(40% + ${panelH / 2}px + 24px)`,
    };

  return (
    <section
      ref={sectionRef}
      className="bp"
      style={{ height: `${SECTION_VH}vh` }}
    >
      <motion.h2
        ref={titleRef}
        className={`bp__title ${isPinned ? "is-fixed" : "is-off"}`}
        style={{
          position: isPinned ? "fixed" : "absolute",
          ...titlePositionStyle,
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
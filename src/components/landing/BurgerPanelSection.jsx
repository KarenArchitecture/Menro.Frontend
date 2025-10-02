import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BurgerPanelSection({
  title = "با منرو تو چشم باش",
  burgerSrc = "/images/burger-landing.png",
  burgerAlt = "برگر سه بعدی منرو",
  haloSrc = "/images/burger-blur.png",
  meshSrc,
}) {
  const sectionRef = useRef(null);
  const sceneRef = useRef(null); // pin THIS at center
  const panelWrapRef = useRef(null); // tilts → flat
  const contentRef = useRef(null); // title slides down
  const stackRef = useRef(null); // burger + halo

  return (
    <section
      ref={sectionRef}
      className="burger-panel"
      aria-labelledby="burger-panel-title"
    >
      <div ref={sceneRef} className="burger-panel__scene">
        <div ref={panelWrapRef} className="burger-panel__panelwrap">
          <div className="burger-panel__panel">
            {meshSrc && (
              <div
                className="burger-panel__mesh"
                style={{ backgroundImage: `url(${meshSrc})` }}
                aria-hidden="true"
              />
            )}
          </div>

          <div
            ref={stackRef}
            className="burger-panel__stack"
            style={{
              position: "absolute",
              left: "50%",
              top: "8%",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            {haloSrc ? (
              <img
                src={haloSrc}
                alt=""
                aria-hidden="true"
                className="burger-panel__spotlight"
              />
            ) : (
              <div className="burger-panel__spotlight" aria-hidden="true" />
            )}

            <img
              className="burger-panel__burger"
              src={burgerSrc}
              alt={burgerAlt}
              decoding="async"
              style={{
                position: "relative",
                left: "auto",
                top: "auto",
                translate: "0 0",
              }}
            />
          </div>

          <div ref={contentRef} className="burger-panel__content">
            <h2 id="burger-panel-title" className="burger-panel__title">
              {title}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { tr } from "framer-motion/client";
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

  useLayoutEffect(() => {
    const nextEl =
      document.querySelector("#next-section") ||
      sectionRef.current?.nextElementSibling ||
      null;

    const ctx = gsap.context(() => {
      // 1) initial states before paint (prevents flicker)
      gsap.set(panelWrapRef.current, {
        rotateX: 30,
        transformOrigin: "50% 100%",
      });
      gsap.set(contentRef.current, { top: "-97%" });
      gsap.set(stackRef.current, { xPercent: -50, yPercent: -18 });

      // 2) one timeline, one ScrollTrigger (pin the section)
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          // align release with the next section if present; else use distance
          endTrigger: nextEl || undefined,
          end: nextEl ? "top top" : "+=160%",
          pin: true,
          pinSpacing: true,
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // pinType:"transform", // uncomment on iOS/nested fixed if you see jitter
          // markers:true,
        },
      });

      tl.to(stackRef.current, { y: () => -1.4 * window.innerHeight }, 0)
        .to(panelWrapRef.current, { rotateX: 0 }, 0)
        .to(contentRef.current, { top: "0%" }, 0.05);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
              transform: "none",
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

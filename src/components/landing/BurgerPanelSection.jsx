// start code
import React from "react";

export default function BurgerPanelSection({
  title = "با منرو تو قوی‌تر باش",
  burgerSrc = "/images/hero/burger.png",
  burgerAlt = "برگر سه بعدی منرو",
  meshSrc, // e.g., "/images/panel/panel-mesh.png" (optional)
}) {
  return (
    <section className="burger-panel" aria-labelledby="burger-panel-title">
      <div className="burger-panel__scene">
        {/* Panel wrapper holds the 3D tilt */}
        <div className="burger-panel__panelwrap">
          <div className="burger-panel__panel">
            {/* Mesh overlay (optional) */}
            {meshSrc && (
              <div
                className="burger-panel__mesh"
                style={{ backgroundImage: `url(${meshSrc})` }}
                aria-hidden="true"
              />
            )}

            {/* Spotlight glow under the burger */}
            <div className="burger-panel__spotlight" aria-hidden="true" />

            {/* Panel content */}
            <div className="burger-panel__content">
              <h2 id="burger-panel-title" className="burger-panel__title">
                {title}
              </h2>
              {/* <p className="burger-panel__subtitle">متن اختیاری…</p> */}
            </div>
          </div>
        </div>

        {/* Burger image above the panel */}
        <img
          className="burger-panel__burger"
          src={burgerSrc}
          alt={burgerAlt}
          decoding="async"
        />
      </div>
    </section>
  );
}

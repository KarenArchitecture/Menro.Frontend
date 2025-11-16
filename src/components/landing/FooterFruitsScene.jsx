import React, { useEffect, useRef } from "react";

const FRUITS = [
  {
    id: "stick",
    src: "/images/landing-bread.png",
    alt: "bread",
    className: "footer-bg__item--bread",
    shift: 18,
  },
  {
    id: "tomato",
    src: "/images/landing-tomato.png",
    alt: "tomato",
    className: "footer-bg__item--tomato",
    shift: 20,
  },
  {
    id: "oil",
    src: "/images/landing-oil.png",
    alt: "olive oil",
    className: "footer-bg__item--oil",
    shift: 22,
  },
  {
    id: "cucumber",
    src: "/images/landing-cucumber.png",
    alt: "cucumber",
    className: "footer-bg__item--cucumber",
    shift: 18,
  },
  {
    id: "carrot",
    src: "/images/landing-juice.png",
    alt: "carrot",
    className: "footer-bg__item--juice",
    shift: 20,
  },
];

export default function FooterFruitsScene() {
  const sceneRef = useRef(null);

  // 1) Fade in when footer enters viewport
  useEffect(() => {
    const root = sceneRef.current;
    if (!root) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const imgs = Array.from(root.querySelectorAll(".footer-bg__item img"));
    if (!imgs.length) return;

    imgs.forEach((img) => {
      img.style.opacity = "0";
      img.style.transition = "opacity 0.7s ease-out";
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          imgs.forEach((img, i) => {
            img.style.transitionDelay = i * 80 + "ms";
            img.style.opacity = "1";
          });

          io.disconnect();
        });
      },
      { threshold: 0.2 }
    );

    io.observe(root);

    return () => {
      io.disconnect();
    };
  }, []);

  // 2) Precise hover-repel using elementFromPoint
  useEffect(() => {
    const root = sceneRef.current;
    if (!root) return;

    // React StrictMode guard so we don't double-bind in dev
    if (root.__fruitsHoverInit) return;
    root.__fruitsHoverInit = true;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const items = Array.from(root.querySelectorAll(".footer-bg__item"));
    if (!items.length) return;

    const states = new Map(); // per-item state

    items.forEach((el) => {
      states.set(el, {
        tx: 0,
        ty: 0,
        targetX: 0,
        targetY: 0,
        raf: 0,
      });
    });

    const lerpAlpha = 0.18; // smoothing
    const SHIFT_MULTIPLIER = 1.4;

    function animate(el) {
      const st = states.get(el);
      if (!st) return;

      st.tx += (st.targetX - st.tx) * lerpAlpha;
      st.ty += (st.targetY - st.ty) * lerpAlpha;

      if (Math.abs(st.tx) < 0.05) st.tx = 0;
      if (Math.abs(st.ty) < 0.05) st.ty = 0;

      const img = el.querySelector("img");
      if (img) {
        img.style.transform = `translate(${st.tx}px, ${st.ty}px)`;
      }

      if (st.tx !== st.targetX || st.ty !== st.targetY) {
        st.raf = requestAnimationFrame(() => animate(el));
      } else {
        st.raf = 0;
      }
    }

    function handlePointerMove(e) {
      // who is *actually* under the cursor?
      const hoveredNode = document.elementFromPoint(e.clientX, e.clientY);
      const hoveredItem = hoveredNode?.closest(".footer-bg__item");

      items.forEach((el) => {
        const st = states.get(el);
        if (!st) return;

        const img = el.querySelector("img");
        if (!img) return;

        if (el === hoveredItem) {
          // only this fruit reacts
          const r = img.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;

          const nx = (x / r.width) * 2 - 1;
          const ny = (y / r.height) * 2 - 1;

          const baseShift = Number(el.dataset.shift || "18");
          const maxShift = baseShift * SHIFT_MULTIPLIER;

          st.targetX = -nx * maxShift;
          st.targetY = -ny * maxShift;
        } else {
          // everyone else eases back to rest
          st.targetX = 0;
          st.targetY = 0;
        }

        if (!st.raf) st.raf = requestAnimationFrame(() => animate(el));
      });
    }

    function handlePointerLeave() {
      // when leaving the whole scene, reset everything
      items.forEach((el) => {
        const st = states.get(el);
        if (!st) return;
        st.targetX = 0;
        st.targetY = 0;
        if (!st.raf) st.raf = requestAnimationFrame(() => animate(el));
      });
    }

    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      items.forEach((el) => {
        const st = states.get(el);
        if (!st) return;
        if (st.raf) cancelAnimationFrame(st.raf);
        const img = el.querySelector("img");
        if (img) img.style.transform = "";
      });
      states.clear();
    };
  }, []);

  return (
    <div className="footer-bg__scene" ref={sceneRef} aria-hidden="true">
      <div className="footer-bg__scene-inner">
        {FRUITS.map((item) => (
          <div
            key={item.id}
            className={`footer-bg__item ${item.className}`}
            data-shift={item.shift}
          >
            <img src={item.src} alt={item.alt} draggable="false" />
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import "../../assets/css/footer-fruits-scene.css";

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

const ALPHA_THRESHOLD = 10; // 0-255, pixels below this are "transparent" for hit-testing
const SAMPLE_MAX_DIM = 150; // downscale canvas for perf; hit-testing doesn't need full res

export default function FooterFruitsScene() {
  const sceneRef = useRef(null);
  const alphaMapsRef = useRef(new Map()); // img element -> { canvas, ctx, w, h }

  // 1) Fade in when footer enters viewport
  useEffect(() => {
    const root = sceneRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobile = window.matchMedia("(max-width: 768px)");
    if (reducedMotion.matches || isMobile.matches) return;

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
      { threshold: 0.2 },
    );

    io.observe(root);
    return () => io.disconnect();
  }, []);

  // 2) Precise hover-repel using per-pixel alpha hit-testing
  useEffect(() => {
    const root = sceneRef.current;
    if (!root) return;

    if (root.__fruitsHoverInit) return;
    root.__fruitsHoverInit = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobile = window.matchMedia("(max-width: 768px)");
    if (reducedMotion.matches || isMobile.matches) return;

    const items = Array.from(root.querySelectorAll(".footer-bg__item"));
    if (!items.length) return;

    const states = new Map();
    items.forEach((el) => {
      states.set(el, { tx: 0, ty: 0, targetX: 0, targetY: 0, raf: 0 });
    });

    // Build a downscaled offscreen canvas per image so we can read alpha values.
    function buildAlphaMap(img) {
      if (alphaMapsRef.current.has(img)) return;

      const naturalW = img.naturalWidth || 1;
      const naturalH = img.naturalHeight || 1;
      const scale = Math.min(1, SAMPLE_MAX_DIM / Math.max(naturalW, naturalH));
      const w = Math.max(1, Math.round(naturalW * scale));
      const h = Math.max(1, Math.round(naturalH * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      try {
        ctx.drawImage(img, 0, 0, w, h);
        alphaMapsRef.current.set(img, { ctx, w, h });
      } catch (err) {
        // Canvas tainted (CORS) or other failure — fall back to bounding-box behavior for this image
        alphaMapsRef.current.set(img, null);
      }
    }

    const imgs = items.map((el) => el.querySelector("img")).filter(Boolean);
    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth) {
        buildAlphaMap(img);
      } else {
        img.addEventListener("load", () => buildAlphaMap(img), { once: true });
      }
    });

    const lerpAlpha = 0.18;
    const SHIFT_MULTIPLIER = 1.4;

    function animate(el) {
      const st = states.get(el);
      if (!st) return;

      st.tx += (st.targetX - st.tx) * lerpAlpha;
      st.ty += (st.targetY - st.ty) * lerpAlpha;

      if (Math.abs(st.tx) < 0.05) st.tx = 0;
      if (Math.abs(st.ty) < 0.05) st.ty = 0;

      const img = el.querySelector("img");
      if (img) img.style.transform = `translate(${st.tx}px, ${st.ty}px)`;

      if (st.tx !== st.targetX || st.ty !== st.targetY) {
        st.raf = requestAnimationFrame(() => animate(el));
      } else {
        st.raf = 0;
      }
    }

    // Returns true if the pixel under (clientX, clientY) on this img is visually opaque.
    function isOpaqueAt(img, clientX, clientY, rect) {
      const map = alphaMapsRef.current.get(img);
      if (!map) return true; // no alpha data yet/available — fall back to bounding box

      const fx = (clientX - rect.left) / rect.width;
      const fy = (clientY - rect.top) / rect.height;
      if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return false;

      const px = Math.min(map.w - 1, Math.max(0, Math.floor(fx * map.w)));
      const py = Math.min(map.h - 1, Math.max(0, Math.floor(fy * map.h)));

      const alpha = map.ctx.getImageData(px, py, 1, 1).data[3];
      return alpha >= ALPHA_THRESHOLD;
    }

    function findHoveredItem(clientX, clientY) {
      // Iterate in reverse DOM order so later (visually stacked-on-top) items win ties.
      for (let i = items.length - 1; i >= 0; i--) {
        const el = items[i];
        const img = el.querySelector("img");
        if (!img) continue;

        const rect = img.getBoundingClientRect();
        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        ) {
          continue;
        }

        if (isOpaqueAt(img, clientX, clientY, rect)) {
          return el;
        }
      }
      return null;
    }

    function handlePointerMove(e) {
      const hoveredItem = findHoveredItem(e.clientX, e.clientY);

      items.forEach((el) => {
        const st = states.get(el);
        if (!st) return;

        const img = el.querySelector("img");
        if (!img) return;

        if (el === hoveredItem) {
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
          st.targetX = 0;
          st.targetY = 0;
        }

        if (!st.raf) st.raf = requestAnimationFrame(() => animate(el));
      });
    }

    function handlePointerLeave() {
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
            <img
              src={item.src}
              alt={item.alt}
              draggable="false"
              crossOrigin="anonymous"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

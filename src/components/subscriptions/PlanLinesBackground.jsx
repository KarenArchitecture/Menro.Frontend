import React, { useEffect, useRef } from "react";

// Canvas-2D port of soju22's "Random, Cos and Sin" polylines pen.
// https://codepen.io/soju22/pen/xxGqJxj

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE = [13, 16, 21]; // card base color (#0d1015)
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

export default function PlanLinesBackground({
  seed = "plan",
  rgb = [255, 104, 60],
  nx = 36, // number of ribbons
  ny = 80, // points per ribbon
  angle = Math.PI / 3,
  timeCoef = 0.1,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rand = mulberry32(hashString(seed));
    const rnd = (a, b) => a + (b - a) * rand();
    const vec3 = (a, b) => [rnd(a, b), rnd(a, b), rnd(a, b)];

    // --- per-ribbon random params (same ranges as the pen) ---
    const strips = Array.from({ length: nx }, (_, i) => {
      const t = 0.25 + 0.75 * (i / nx);
      return {
        x: -1 + (2 / nx) / 2 + i * (2 / nx),
        r1: vec3(-1, 1),
        r2: vec3(-1, 1),
        r3: vec3(-1, 1),
        r4: vec3(-1, 1),
        r5: [rnd(0.2, 0.5), rnd(0.3, 0.6), rnd(0.4, 0.7)],
        c1: css(mix(BASE, rgb, t)),
        c2: css(mix(BASE, rgb, t * 0.3)),
      };
    });

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const size = 1.5 / nx;
    const dy = -2 / (ny - 1);
    const timeOffset = rnd(0, 50);

    let W = 0;
    let H = 0;
    let running = false;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);

      const S = Math.max(W, H) / 2; // clip-space → px (keeps ribbons undistorted)
      const cx = W / 2;
      const cy = H / 2;
      const time = (now * 0.001 + timeOffset) * timeCoef;

      // ribbon normal in clip space (before the width wobble)
      const nX = 1.5 * cosA * size;
      const nY = 1.5 * sinA * size;

      for (const st of strips) {
        const a1 = st.r1.map((v, k) => Math.cos(time * v + st.r3[k]));
        const a2 = st.r2.map((v, k) => Math.cos(time * v + st.r4[k]));

        const left = [];
        const right = [];

        for (let j = 0; j < ny; j++) {
          const y = 1 + j * dy;
          const px = 1.5 * (st.x * cosA - y * sinA);
          const py = 1.5 * (st.x * sinA + y * cosA);

          const f =
            1 +
            st.r5[0] * (Math.cos((y + a1[0]) * 20 * a1[1]) + 1) +
            st.r5[1] * (Math.sin((y + a2[0]) * 20 * a2[1]) + 1) +
            st.r5[2] * (Math.cos((y + a1[2]) * 20 * a2[2]) + 1);

          left.push([cx + (px + nX * f) * S, cy - (py + nY * f) * S]);
          right.push([cx + (px - nX * f) * S, cy - (py - nY * f) * S]);
        }

        // colour runs across the ribbon's width (c1 on one edge → darker c2)
        const mx = cx + 1.5 * (st.x * cosA) * S;
        const my = cy - 1.5 * (st.x * sinA) * S;
        const k = 2.5;
        const g = ctx.createLinearGradient(
          mx + nX * k * S,
          my - nY * k * S,
          mx - nX * k * S,
          my + nY * k * S,
        );
        g.addColorStop(0, st.c1);
        g.addColorStop(1, st.c2);

        ctx.beginPath();
        ctx.moveTo(left[0][0], left[0][1]);
        for (let j = 1; j < ny; j++) ctx.lineTo(left[j][0], left[j][1]);
        for (let j = ny - 1; j >= 0; j--) ctx.lineTo(right[j][0], right[j][1]);
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();
      }
    };

    const loop = (now) => {
      if (!running) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    resize();
    draw(0);

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);

    // only animate while the card is actually on screen
    const io = new IntersectionObserver(([entry]) => {
      if (reduced) return;
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [seed, rgb, nx, ny, angle, timeCoef]);

  return (
    <canvas
      ref={canvasRef}
      className="sub-plan-card__lines"
      aria-hidden="true"
    />
  );
}
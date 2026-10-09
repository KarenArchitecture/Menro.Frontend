// src/components/blog/ParticleField.jsx
//
// Floating-particle background, ported from the CodePen (createjs + TweenMax)
// to plain canvas 2D. No extra libraries needed.
//
//  - a "sun": a radial gradient rising from the bottom-center that spreads
//    over the whole section (#271b10 at the source -> #0d1013 at the far edge)
//  - 3 layers of particles (small rings, medium dots, large soft blobs) that are
//    warm and bright near the sun and cool down and fade the further they are
//  - 3 big soft "lights" that slowly breathe and drift around the sun
//  - particles are gently pushed away by the mouse and drift back
//  - pauses when scrolled out of view, and is static for reduced motion
//
// The canvas fills its parent (which must be position: relative) and sits at
// z-index -1, so the parent should have `isolation: isolate`. BlogHero does.
import React, { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/* Look (same numbers as the CodePen)                                  */
/* ------------------------------------------------------------------ */

const LAYERS = [
  { num: 300, ballwidth: 3, alphamax: 0.4, areaHeight: 0.5, color: "#F0F0F0", fill: false, push: 1 },
  { num: 100, ballwidth: 8, alphamax: 0.3, areaHeight: 1, color: "#C0C0C0", fill: true, push: 0.8 },
  { num: 10, ballwidth: 30, alphamax: 0.2, areaHeight: 1, color: "#A0A0A0", fill: true, push: 0.4 },
];

const LIGHTS = [
  { w: 400, h: 100, alpha: 0.6, ox: 0, oy: 0, color: "#D0D0D0" },
  { w: 350, h: 250, alpha: 0.3, ox: -50, oy: 0, color: "#B8B8B8" },
  { w: 100, h: 80, alpha: 0.2, ox: 80, oy: -50, color: "#F8F8F8" },
];

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

// The sun (radial gradient). Source = bottom-center of the section.
const SUN_COLOR = "#271b10"; // color at the source
const EDGE_COLOR = "#0d1013"; // color at the far edge (the top corners)
const SUN_INTRO_S = 3; // seconds for the glow to spread across the section
const BREATHE_AMOUNT = 0.04; // how much the glow slowly swells (0 = none)
const BREATHE_PERIOD_S = 9; // seconds per swell

// Particles near the sun are warm + bright, far ones are cool + faint
const PARTICLE_WARM = "#FFB070"; // tint right at the source
const WARM_AMOUNT = 0.85; // 0 = no tint at the source, 1 = fully warm
const NEAR_BOOST = 1.15; // brightness multiplier at the source
const FAR_ALPHA = 0.35; // brightness multiplier at the far edge
const TINT_STEPS = 6; // number of color steps between near and far

// Where particles gather vertically (0.5 = middle, larger = lower, closer to the sun)
const PARTICLE_CENTER_Y = 0.6;

// The 3 soft lights hover around this height and pick up some warm tint
const LIGHT_ANCHOR_Y = 0.85;
const LIGHT_WARMTH = 0.5;

const MAX_DPR = 2; // cap canvas resolution for performance
const MOBILE_WIDTH = 768; // below this, use fewer particles
const MOBILE_COUNT_SCALE = 0.5;

// How far the glow of each light spreads, relative to its ellipse size
const LIGHT_SPREAD_X = 0.9;
const LIGHT_SPREAD_Y = 1.3;

// Mouse interaction
const POINTER_RADIUS = 150; // px around the cursor that pushes particles
const POINTER_FORCE = 1500; // px/s^2
const RETURN_SPRING = 6; // how fast pushed particles drift back
const RETURN_DAMPING = 3;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const range = (min, max) => min + (max - min) * Math.random();
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
const easeInOutQuad = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const smoothstep = (t) => t * t * (3 - 2 * t);

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(a, b, t) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const h = (v) => Math.round(v).toString(16).padStart(2, "0");
  return `#${h(lerp(ar, br, t))}${h(lerp(ag, bg, t))}${h(lerp(ab, bb, t))}`;
}

// Gradient stops for the sun: many stops on a smooth curve give a soft,
// natural falloff instead of a flat two-color ramp.
const SUN_STOPS = Array.from({ length: 9 }, (_, i) => {
  const t = i / 8;
  return [t, mixHex(SUN_COLOR, EDGE_COLOR, smoothstep(t))];
});

// random value in [0, total], but `strength` of the time inside `band`
function weightedRange(total, band, strength) {
  if (Math.random() <= strength) return range(band[0], band[1]);
  return range(0, total);
}

/* ---- Pre-rendered sprites (drawing images is far cheaper than shapes) ---- */

function makeSoftSprite(color, radius, dpr) {
  const R = Math.ceil(radius * 1.8);
  const size = Math.ceil(R * 2 * dpr);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const [r, gr, b] = hexToRgb(color);
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${r},${gr},${b},1)`);
  grad.addColorStop(0.5, `rgba(${r},${gr},${b},0.9)`);
  grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return { canvas: c, R };
}

function makeRingSprite(color, radius, dpr) {
  const R = Math.ceil(radius + 2);
  const size = Math.ceil(R * 2 * dpr);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  g.scale(dpr, dpr);
  g.beginPath();
  g.arc(R, R, radius, 0, Math.PI * 2);
  g.lineWidth = 1;
  g.strokeStyle = color;
  g.stroke();
  return { canvas: c, R };
}

function makeLightSprite(color) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const [r, gr, b] = hexToRgb(color);
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${r},${gr},${b},0.75)`);
  grad.addColorStop(0.25, `rgba(${r},${gr},${b},0.45)`);
  grad.addColorStop(0.55, `rgba(${r},${gr},${b},0.14)`);
  grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * pointerRef: optional ref to { clientX, clientY, inside } (see useHeroPointer)
 */
export default function ParticleField({ pointerRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let spriteDpr = 0;
    let countScale = 0;
    let sprites = [];
    let lightSprites = [];
    let particles = [];

    let raf = 0;
    let last = 0;
    let time = reduced ? 6 : 0;
    let inView = true;

    /* ---------- particles ---------- */

    const place = (p) => {
      const half = p.layer.areaHeight / 8;
      p.initY = weightedRange(
        H,
        [H * (PARTICLE_CENTER_Y - half), H * (PARTICLE_CENTER_Y + half)],
        0.8,
      );
      p.initX = weightedRange(W, [W / 4, (W * 3) / 4], 0.6);
    };

    const startSegment = (p, first) => {
      p.x0 = p.x;
      p.y0 = p.y;
      p.s0 = p.scale;
      p.a0 = p.alpha;
      p.x1 = range(p.initX - p.distance, p.initX + p.distance);
      p.y1 = range(p.initY - p.distance, p.initY + p.distance);
      p.s1 = range(0.3, 1);
      p.aPeak = range(0.1, p.alphaMax);
      p.dur = p.speed;
      p.speed = range(2, 10);
      p.t = first ? Math.random() * p.dur : 0;
    };

    const spawn = () => {
      particles = [];
      LAYERS.forEach((layer, li) => {
        const count = Math.round(layer.num * countScale);
        for (let i = 0; i < count; i++) {
          const p = {
            li,
            layer,
            alphaMax: layer.alphamax,
            distance: layer.ballwidth * 2,
            speed: range(2, 10),
            scale: range(0.3, 1),
            alpha: range(0, 0.1),
            offX: 0,
            offY: 0,
            vx: 0,
            vy: 0,
          };
          place(p);
          p.x = p.initX;
          p.y = p.initY;
          startSegment(p, true);
          particles.push(p);
        }
      });
    };

    /* ---------- sizing ---------- */

    const measure = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;

      const nextDpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      W = w;
      H = h;
      dpr = nextDpr;

      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      if (spriteDpr !== dpr) {
        // one sprite per layer per "distance from the sun" step
        sprites = LAYERS.map((l) =>
          Array.from({ length: TINT_STEPS }, (_, b) => {
            const warm = WARM_AMOUNT * (1 - b / (TINT_STEPS - 1));
            const color = mixHex(l.color, PARTICLE_WARM, warm);
            return l.fill
              ? makeSoftSprite(color, l.ballwidth, dpr)
              : makeRingSprite(color, l.ballwidth, dpr);
          }),
        );
        lightSprites = LIGHTS.map((l) =>
          makeLightSprite(mixHex(l.color, PARTICLE_WARM, LIGHT_WARMTH)),
        );
        spriteDpr = dpr;
      }

      const nextScale = W < MOBILE_WIDTH ? MOBILE_COUNT_SCALE : 1;
      if (!particles.length || nextScale !== countScale) {
        countScale = nextScale;
        spawn();
      } else {
        particles.forEach((p) => {
          place(p);
          p.x = p.initX;
          p.y = p.initY;
          startSegment(p, true);
        });
      }

      if (reduced) {
        step(0, null);
        draw();
      }
    };

    /* ---------- simulation ---------- */

    function step(dt, rect) {
      const ptr = pointerRef?.current;
      const hasPtr = Boolean(ptr?.inside && rect);
      const px = hasPtr ? ptr.clientX - rect.left : 0;
      const py = hasPtr ? ptr.clientY - rect.top : 0;
      const R2 = POINTER_RADIUS * POINTER_RADIUS;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.t += dt;
        if (p.t >= p.dur) {
          p.t -= p.dur;
          p.x = p.x1;
          p.y = p.y1;
          p.scale = p.s1;
          p.alpha = 0;
          startSegment(p, false);
        }

        const u = Math.min(1, p.t / p.dur);
        const e = easeInOutCubic(u);
        p.x = lerp(p.x0, p.x1, e);
        p.y = lerp(p.y0, p.y1, e);
        p.scale = lerp(p.s0, p.s1, e);
        p.alpha =
          u < 0.5
            ? lerp(p.a0, p.aPeak, easeOutQuad(u / 0.5))
            : p.aPeak * (1 - easeOutQuad((u - 0.5) / 0.5));

        if (dt > 0) {
          if (hasPtr) {
            const dx = p.x + p.offX - px;
            const dy = p.y + p.offY - py;
            const d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const d = Math.sqrt(d2) || 1;
              const f = (1 - d / POINTER_RADIUS) * POINTER_FORCE * p.layer.push;
              p.vx += (dx / d) * f * dt;
              p.vy += (dy / d) * f * dt;
            }
          }
          p.vx += (-p.offX * RETURN_SPRING - p.vx * RETURN_DAMPING) * dt;
          p.vy += (-p.offY * RETURN_SPRING - p.vy * RETURN_DAMPING) * dt;
          p.offX += p.vx * dt;
          p.offY += p.vy * dt;
        }
      }
    }

    /* ---------- drawing ---------- */

    function lightState(i) {
      const cx = W / 2;
      const cy = H * LIGHT_ANCHOR_Y;
      const L = LIGHTS[i];

      const cfg = [
        { dur: 10, delay: 0 },
        { dur: 12, delay: 5 },
        { dur: 8, delay: 2 },
      ][i];
      const tl = Math.max(0, time - cfg.delay);
      const ph = (tl % (2 * cfg.dur)) / cfg.dur;
      const e = easeInOutQuad(ph <= 1 ? ph : 2 - ph);

      if (i === 0) {
        return { x: cx + L.ox, y: cy + L.oy, sx: lerp(1.5, 2, e), sy: lerp(1, 0.7, e) };
      }
      if (i === 1) {
        return {
          x: lerp(cx + L.ox, cx + 100, e),
          y: lerp(cy + L.oy, cy - 50, e),
          sx: lerp(1, 2, e),
          sy: lerp(1, 2, e),
        };
      }
      return {
        x: lerp(cx + L.ox, cx - 200, e),
        y: lerp(cy + L.oy, cy, e),
        sx: lerp(1, 1.5, e),
        sy: lerp(1, 1.5, e),
      };
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // The sun: radial gradient from the bottom-center. It spreads out over
      // SUN_INTRO_S seconds, then slowly swells in and out.
      const sx = W / 2;
      const sy = H;
      const reach = Math.hypot(W / 2, H); // distance to the far top corners
      const grow = easeOutCubic(Math.min(1, time / SUN_INTRO_S));
      const swell =
        1 + BREATHE_AMOUNT * Math.sin((time * 2 * Math.PI) / BREATHE_PERIOD_S);
      const radius = reach * lerp(0.2, 1, grow) * swell;

      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
      for (let i = 0; i < SUN_STOPS.length; i++) {
        sun.addColorStop(SUN_STOPS[i][0], SUN_STOPS[i][1]);
      }
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, W, H);

      // background lights
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < LIGHTS.length; i++) {
        const L = LIGHTS[i];
        const s = lightState(i);
        const rx = L.w * LIGHT_SPREAD_X * s.sx;
        const ry = L.h * LIGHT_SPREAD_Y * s.sy;
        ctx.globalAlpha = L.alpha;
        ctx.drawImage(lightSprites[i], s.x - rx, s.y - ry, rx * 2, ry * 2);
      }

      // particles: warm + bright near the sun, cool + faint far from it
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0.002) continue;

        const x = p.x + p.offX;
        const y = p.y + p.offY;
        const d = Math.min(1, Math.hypot(x - sx, y - sy) / reach);
        const bucket = Math.round(d * (TINT_STEPS - 1));
        const a = Math.min(1, p.alpha * lerp(NEAR_BOOST, FAR_ALPHA, d));
        if (a <= 0.002) continue;

        const sp = sprites[p.li][bucket];
        const size = sp.R * 2 * p.scale;
        ctx.globalAlpha = a;
        ctx.drawImage(sp.canvas, x - sp.R * p.scale, y - sp.R * p.scale, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    /* ---------- loop ---------- */

    const frame = (now) => {
      raf = 0;
      if (!inView || document.hidden) {
        last = 0;
        return;
      }
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      time += dt;

      step(dt, canvas.getBoundingClientRect());
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || reduced || !inView || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => start();

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      start();
    });
    io.observe(host);

    const ro = new ResizeObserver(measure);
    ro.observe(host);

    document.addEventListener("visibilitychange", onVisibility);

    measure();
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pointerRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
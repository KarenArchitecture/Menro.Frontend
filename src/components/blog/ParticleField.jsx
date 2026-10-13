// src/components/blog/ParticleField.jsx
//
// Food-themed floating particles on a transparent canvas.
// Sesame seeds, basil leaves, chili flakes, peppercorns, orange slices and
// warm bokeh glows rise slowly, sway, spin and tumble. Mouse pushes them away.
// The background colour/gradient comes from CSS (.blog-hero-section).
import React, { useEffect, useRef } from "react";

const SPRITE_SIZE = 48; // logical px of each pre-rendered sprite
const MAX_DPR = 2;
const BASE_COUNT = 46;
const MOBILE_WIDTH = 768;
const MOBILE_SCALE = 0.5;

const POINTER_RADIUS = 140;
const POINTER_FORCE = 1400;
const RETURN_SPRING = 6;
const RETURN_DAMPING = 3;

const TAU = Math.PI * 2;
const range = (a, b) => a + (b - a) * Math.random();
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------------- sprite drawings (48 x 48 box) ---------------- */

function drawSesame(g) {
  g.translate(24, 24);
  g.beginPath();
  g.ellipse(0, 0, 8, 14, 0, 0, TAU);
  g.fillStyle = "#F5E6BC";
  g.fill();
  g.lineWidth = 2;
  g.strokeStyle = "#C9A45C";
  g.stroke();
  g.beginPath();
  g.ellipse(-2.5, -5, 2, 5, 0.2, 0, TAU);
  g.fillStyle = "rgba(255,255,255,0.6)";
  g.fill();
}

function drawLeaf(g) {
  const grad = g.createLinearGradient(24, 4, 24, 44);
  grad.addColorStop(0, "#86C262");
  grad.addColorStop(1, "#3B8236");
  g.beginPath();
  g.moveTo(24, 4);
  g.bezierCurveTo(44, 14, 44, 36, 24, 44);
  g.bezierCurveTo(4, 36, 4, 14, 24, 4);
  g.fillStyle = grad;
  g.fill();
  g.strokeStyle = "rgba(255,255,255,0.45)";
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(24, 8);
  g.lineTo(24, 44);
  for (let i = 0; i < 3; i++) {
    const y = 16 + i * 8;
    g.moveTo(24, y + 4);
    g.lineTo(15, y - 2);
    g.moveTo(24, y + 4);
    g.lineTo(33, y - 2);
  }
  g.stroke();
}

function drawChili(g) {
  g.translate(24, 24);
  g.rotate(-0.5);
  g.beginPath();
  g.ellipse(0, 0, 17, 7, 0, 0, TAU);
  g.fillStyle = "#D93A22";
  g.fill();
  g.beginPath();
  g.ellipse(-3, -2, 10, 3, 0, 0, TAU);
  g.fillStyle = "rgba(255,140,110,0.55)";
  g.fill();
  g.beginPath();
  g.arc(6, 1, 1.6, 0, TAU);
  g.fillStyle = "#F7E3A1";
  g.fill();
}

function drawPepper(g) {
  const grad = g.createRadialGradient(21, 20, 1, 24, 24, 10);
  grad.addColorStop(0, "#6B5A52");
  grad.addColorStop(1, "#2A201C");
  g.beginPath();
  g.arc(24, 24, 9, 0, TAU);
  g.fillStyle = grad;
  g.fill();
  g.beginPath();
  g.arc(21, 20, 2.4, 0, TAU);
  g.fillStyle = "rgba(255,255,255,0.35)";
  g.fill();
}

function drawCitrus(g) {
  g.beginPath();
  g.arc(24, 24, 21, 0, TAU);
  g.fillStyle = "#FFA31A";
  g.fill();
  g.beginPath();
  g.arc(24, 24, 18, 0, TAU);
  g.fillStyle = "#FFE08A";
  g.fill();
  g.strokeStyle = "#FFB94D";
  g.lineWidth = 1.6;
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    g.moveTo(24, 24);
    g.lineTo(24 + Math.cos(a) * 17, 24 + Math.sin(a) * 17);
  }
  g.stroke();
  g.beginPath();
  g.arc(24, 24, 2.5, 0, TAU);
  g.fillStyle = "#FFF3C9";
  g.fill();
}

function drawBokeh(g) {
  const grad = g.createRadialGradient(24, 24, 0, 24, 24, 23);
  grad.addColorStop(0, "rgba(255,196,130,0.75)");
  grad.addColorStop(0.6, "rgba(255,176,100,0.35)");
  grad.addColorStop(1, "rgba(255,170,90,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 48, 48);
}

// weight = how common, size = drawn size range in px, flip = tumbles in 3D
const TYPES = [
  { draw: drawSesame, weight: 28, size: [8, 14], flip: true, alpha: [0.7, 1] },
  { draw: drawLeaf, weight: 16, size: [16, 30], flip: true, alpha: [0.75, 1] },
  { draw: drawChili, weight: 16, size: [10, 18], flip: true, alpha: [0.75, 1] },
  { draw: drawPepper, weight: 10, size: [7, 12], flip: false, alpha: [0.7, 0.95] },
  { draw: drawCitrus, weight: 8, size: [22, 38], flip: true, alpha: [0.65, 0.9] },
  { draw: drawBokeh, weight: 22, size: [24, 64], flip: false, alpha: [0.25, 0.5] },
];
const TOTAL_WEIGHT = TYPES.reduce((s, t) => s + t.weight, 0);

function pickType() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < TYPES.length; i++) {
    r -= TYPES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

function makeSprite(draw, dpr) {
  const c = document.createElement("canvas");
  c.width = c.height = Math.ceil(SPRITE_SIZE * dpr);
  const g = c.getContext("2d");
  g.scale(dpr, dpr);
  draw(g);
  return c;
}

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
    let sprites = [];
    let particles = [];
    let raf = 0;
    let last = 0;
    let time = 0;
    let inView = true;

    const makeParticle = (anywhere) => {
      const ti = pickType();
      const T = TYPES[ti];
      const depth = Math.random();
      const size = range(T.size[0], T.size[1]) * lerp(0.7, 1.15, depth);
      return {
        ti,
        depth,
        size,
        alpha: range(T.alpha[0], T.alpha[1]) * lerp(0.6, 1, depth),
        baseX: range(0, W),
        y: anywhere ? range(0, H) : H + size,
        vy: range(14, 34) * lerp(0.6, 1.2, depth),
        amp: range(8, 26),
        freq: range(0.4, 1.1),
        phase: range(0, TAU),
        rot: range(0, TAU),
        rotSpeed: range(-0.8, 0.8),
        flipSpeed: T.flip ? range(0.8, 2.2) : 0,
        offX: 0,
        offY: 0,
        vx: 0,
        vy2: 0,
      };
    };

    const spawn = () => {
      const count = Math.round(BASE_COUNT * (W < MOBILE_WIDTH ? MOBILE_SCALE : 1));
      particles = Array.from({ length: count }, () => makeParticle(true));
      particles.sort((a, b) => a.depth - b.depth); // far ones first
    };

    const posX = (p) =>
      p.baseX + Math.sin(time * p.freq + p.phase) * p.amp + p.offX;

    const measure = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      W = w;
      H = h;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      if (spriteDpr !== dpr) {
        sprites = TYPES.map((t) => makeSprite(t.draw, dpr));
        spriteDpr = dpr;
      }
      spawn();
      if (reduced) draw();
    };

    function step(dt, rect) {
      const ptr = pointerRef?.current;
      const hasPtr = Boolean(ptr?.inside && rect);
      const px = hasPtr ? ptr.clientX - rect.left : 0;
      const py = hasPtr ? ptr.clientY - rect.top : 0;
      const R2 = POINTER_RADIUS * POINTER_RADIUS;

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.y -= p.vy * dt;
        p.rot += p.rotSpeed * dt;

        if (p.y < -p.size) {
          const n = makeParticle(false);
          n.depth = p.depth; // keep draw order stable
          particles[i] = p = n;
        }

        if (hasPtr) {
          const dx = posX(p) - px;
          const dy = p.y + p.offY - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / POINTER_RADIUS) * POINTER_FORCE * lerp(0.5, 1, p.depth);
            p.vx += (dx / d) * f * dt;
            p.vy2 += (dy / d) * f * dt;
          }
        }
        p.vx += (-p.offX * RETURN_SPRING - p.vx * RETURN_DAMPING) * dt;
        p.vy2 += (-p.offY * RETURN_SPRING - p.vy2 * RETURN_DAMPING) * dt;
        p.offX += p.vx * dt;
        p.offY += p.vy2 * dt;
      }
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const x = posX(p);
        const y = p.y + p.offY;

        // fade in near the bottom, fade out toward the top
        const fade = clamp((H - y) / (H * 0.12), 0, 1) * clamp(y / (H * 0.3), 0, 1);
        const a = p.alpha * fade;
        if (a < 0.01) continue;

        const sx = p.flipSpeed
          ? 0.25 + 0.75 * Math.abs(Math.cos(time * p.flipSpeed + p.phase))
          : 1;

        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(x, y);
        ctx.rotate(p.rot);
        ctx.scale(sx, 1);
        ctx.drawImage(sprites[p.ti], -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

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
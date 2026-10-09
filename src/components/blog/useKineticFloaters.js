
import { useEffect } from "react";

/**
 * Gives the floating food images a tiny physics simulation:
 *
 *  - the mouse PUSHES them away and CARRIES them along when you sweep past,
 *    and a sweep off-centre makes them SPIN
 *  - they are tied to their home spot with a springy tether, so they wobble
 *    back after being hit
 *  - they COLLIDE with each other (heavier = bigger images shove smaller ones)
 *    and BOUNCE off the edges of the hero
 *  - fast movement stretches them slightly, and a hard hit gives a little pop
 *
 * The images keep their CSS position and CSS float animation: movement is
 * applied with the separate `translate`, `rotate` and `scale` CSS properties,
 * which stack on top of `transform` instead of replacing it.
 *
 * The loop sleeps when everything is at rest, and when the hero is off screen.
 */

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

const SELECTOR = ".floating-img";

const SPRING = 28; // pull back to the home spot (higher = snappier)
const DAMPING = 4.2; // lower = more wobble before settling
const ROT_SPRING = 16; // pull back to upright
const ROT_DAMPING = 3.4;

const POINTER_PAD = 26; // px beyond the image edge where the push begins
const PUSH = 7000; // push away from the cursor (px/s^2)
const FOLLOW = 10; // how much an image is carried by the cursor's motion
const SPIN = 3; // how much a sweep spins an image

const MAX_SPEED = 2400; // px/s
const RESTITUTION = 0.82; // bounciness of collisions (1 = perfectly bouncy)
const HIT_SCALE = 0.4; // collision size, as a fraction of the image size
const WALL_OVERSHOOT = 0.5; // how far (in radii) an image may poke past the hero edge

const MAX_STRETCH = 0.1; // extra scale at high speed
const POP = 0.08; // extra scale pulse on a hard collision

/* ------------------------------------------------------------------ */

const lerp = (a, b, t) => a + (b - a) * t;

export default function useKineticFloaters(sectionRef, pointerRef) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(section.querySelectorAll(SELECTOR));
    if (!els.length) return;

    const bodies = els.map((el) => ({
      el,
      x: 0, // displacement from the home spot
      y: 0,
      vx: 0,
      vy: 0,
      rot: 0,
      vr: 0,
      pulse: 0,
      // set by measure():
      rv: 40, // visual radius (pointer reach)
      rc: 30, // collision radius
      mass: 900,
      // set every frame:
      cx: 0, // home center, in hero coordinates
      cy: 0,
    }));

    bodies.forEach((b) => {
      b.el.style.willChange = "translate, rotate, scale";
    });

    let raf = 0;
    let last = 0;
    let inView = true;

    // pointer velocity (screen px/s), smoothed
    let pvx = 0;
    let pvy = 0;
    let prevPx = null;
    let prevPy = null;

    const measure = () => {
      bodies.forEach((b) => {
        const size = Math.min(b.el.offsetWidth, b.el.offsetHeight) || 80;
        b.rv = size * 0.5;
        b.rc = size * HIT_SCALE;
        b.mass = b.rc * b.rc;
      });
    };

    const clearStyles = () => {
      bodies.forEach((b) => {
        b.el.style.translate = "";
        b.el.style.rotate = "";
        b.el.style.scale = "";
      });
    };

    const isQuiet = (hasPtr) => {
      if (hasPtr) return false;
      return bodies.every(
        (b) =>
          Math.abs(b.x) < 0.05 &&
          Math.abs(b.y) < 0.05 &&
          Math.abs(b.vx) < 1 &&
          Math.abs(b.vy) < 1 &&
          Math.abs(b.rot) < 0.05 &&
          Math.abs(b.vr) < 0.5 &&
          b.pulse < 0.005,
      );
    };

    const frame = (now) => {
      raf = 0;
      if (!inView || document.hidden) {
        last = 0;
        return;
      }

      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;

      const sRect = section.getBoundingClientRect();
      const W = sRect.width;
      const H = sRect.height;

      /* ----- pointer ----- */
      const ptr = pointerRef?.current;
      const hasPtr = Boolean(ptr?.inside);
      const px = hasPtr ? ptr.clientX - sRect.left : 0;
      const py = hasPtr ? ptr.clientY - sRect.top : 0;

      if (hasPtr && prevPx !== null) {
        // velocity from SCREEN coordinates, so scrolling doesn't fling things
        pvx = lerp(pvx, (ptr.clientX - prevPx) / dt, 0.35);
        pvy = lerp(pvy, (ptr.clientY - prevPy) / dt, 0.35);
      } else {
        pvx *= 0.8;
        pvy *= 0.8;
      }
      prevPx = hasPtr ? ptr.clientX : null;
      prevPy = hasPtr ? ptr.clientY : null;

      /* ----- find each image's home center (CSS position, animation included) ----- */
      for (const b of bodies) {
        const r = b.el.getBoundingClientRect();
        b.cx = r.left - sRect.left + r.width / 2 - b.x;
        b.cy = r.top - sRect.top + r.height / 2 - b.y;
      }

      /* ----- forces + integration ----- */
      for (const b of bodies) {
        const wx = b.cx + b.x;
        const wy = b.cy + b.y;

        // tether to home
        b.vx += (-SPRING * b.x - DAMPING * b.vx) * dt;
        b.vy += (-SPRING * b.y - DAMPING * b.vy) * dt;
        b.vr += (-ROT_SPRING * b.rot - ROT_DAMPING * b.vr) * dt;

        // pointer
        if (hasPtr) {
          const dx = wx - px;
          const dy = wy - py;
          const dist = Math.hypot(dx, dy) || 0.001;
          const reach = b.rv + POINTER_PAD;

          if (dist < reach) {
            const k = 1 - dist / reach; // 0 at the edge of reach, 1 at the center
            const nx = dx / dist;
            const ny = dy / dist;

            // 1) shove away from the cursor
            b.vx += nx * PUSH * k * dt;
            b.vy += ny * PUSH * k * dt;

            // 2) get carried along by the cursor's motion
            const f = Math.min(1, FOLLOW * k * dt);
            b.vx += (pvx - b.vx) * f;
            b.vy += (pvy - b.vy) * f;

            // 3) spin from an off-centre sweep (torque = rel x velocity)
            b.vr += (ny * pvx - nx * pvy) * SPIN * k * dt;
          }
        }

        // speed limit
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > MAX_SPEED) {
          b.vx = (b.vx / sp) * MAX_SPEED;
          b.vy = (b.vy / sp) * MAX_SPEED;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.vr * dt;
      }

      /* ----- collisions between images ----- */
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const c = bodies[j];

          const dx = c.cx + c.x - (a.cx + a.x);
          const dy = c.cy + c.y - (a.cy + a.y);
          const dist = Math.hypot(dx, dy) || 0.001;
          const minDist = a.rc + c.rc;
          if (dist >= minDist) continue;

          const nx = dx / dist;
          const ny = dy / dist;
          const invA = 1 / a.mass;
          const invC = 1 / c.mass;
          const invSum = invA + invC;

          // push them apart (lighter one moves more)
          const overlap = minDist - dist;
          a.x -= nx * overlap * (invA / invSum);
          a.y -= ny * overlap * (invA / invSum);
          c.x += nx * overlap * (invC / invSum);
          c.y += ny * overlap * (invC / invSum);

          // bounce along the contact line
          const rvx = c.vx - a.vx;
          const rvy = c.vy - a.vy;
          const vn = rvx * nx + rvy * ny;

          if (vn < 0) {
            const impulse = (-(1 + RESTITUTION) * vn) / invSum;
            a.vx -= impulse * invA * nx;
            a.vy -= impulse * invA * ny;
            c.vx += impulse * invC * nx;
            c.vy += impulse * invC * ny;

            // rubbing along the contact makes both spin a little
            const vt = rvx * -ny + rvy * nx;
            a.vr += vt * 0.25;
            c.vr += vt * 0.25;

            // hard hit -> little pop
            const hit = Math.min(1, -vn / 1200);
            a.pulse = Math.max(a.pulse, hit);
            c.pulse = Math.max(c.pulse, hit);
          }
        }
      }

      /* ----- bounce off the hero's edges ----- */
      for (const b of bodies) {
        const o = b.rc * WALL_OVERSHOOT;
        const wx = b.cx + b.x;
        const wy = b.cy + b.y;
        const minX = -o;
        const maxX = W + o;
        const minY = -o;
        const maxY = H + o;

        if (wx < minX) {
          b.x += minX - wx;
          b.vx = Math.abs(b.vx) * RESTITUTION;
        } else if (wx > maxX) {
          b.x -= wx - maxX;
          b.vx = -Math.abs(b.vx) * RESTITUTION;
        }
        if (wy < minY) {
          b.y += minY - wy;
          b.vy = Math.abs(b.vy) * RESTITUTION;
        } else if (wy > maxY) {
          b.y -= wy - maxY;
          b.vy = -Math.abs(b.vy) * RESTITUTION;
        }
      }

      /* ----- apply ----- */
      for (const b of bodies) {
        const speed = Math.hypot(b.vx, b.vy);
        const scale =
          1 + Math.min(MAX_STRETCH, speed / 30000) + b.pulse * POP;
        b.pulse *= Math.exp(-dt * 7);

        b.el.style.translate = `${b.x.toFixed(2)}px ${b.y.toFixed(2)}px`;
        b.el.style.rotate = `${b.rot.toFixed(2)}deg`;
        b.el.style.scale = scale.toFixed(3);
      }

      /* ----- sleep when everything is at rest ----- */
      if (isQuiet(hasPtr)) {
        bodies.forEach((b) => {
          b.x = b.y = b.vx = b.vy = b.rot = b.vr = b.pulse = 0;
        });
        clearStyles();
        last = 0;
        return;
      }

      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || !inView || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      wake();
    });
    io.observe(section);

    const ro = new ResizeObserver(measure);
    ro.observe(section);
    bodies.forEach((b) => ro.observe(b.el));

    section.addEventListener("pointermove", wake, { passive: true });
    section.addEventListener("pointerdown", wake, { passive: true });
    document.addEventListener("visibilitychange", wake);

    measure();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      section.removeEventListener("pointermove", wake);
      section.removeEventListener("pointerdown", wake);
      document.removeEventListener("visibilitychange", wake);
      clearStyles();
      bodies.forEach((b) => {
        b.el.style.willChange = "";
      });
    };
  }, [sectionRef, pointerRef]);
}
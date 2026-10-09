// src/components/landing/StatsSection.jsx
import React, { useRef, useEffect, useLayoutEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

// Count-up length per number (ms), plus a small delay between numbers.
// Longest total = COUNT_DURATION_MS + 3 * STAGGER_MS  ->  about 3.7s
// Want it slower? Raise COUNT_DURATION_MS (e.g. 5000 for ~5s).
const COUNT_DURATION_MS = 3500;
const STAGGER_MS = 120;

// How long each number takes to fade/slide in when the section is reached (ms).
// The numbers are invisible until then, so no "+0" is ever sitting on the page.
const REVEAL_MS = 700;

// The animation starts once the stats row is inside the screen:
// its top edge must be above this fraction of the viewport height
// (0.85 = the row has risen into the top 85% of the screen).
const START_AT_VIEWPORT = 0.85;

// The row must stay in view this long (ms) before counting begins.
// This ignores brief flickers (layout shifts while the page is loading).
const CONFIRM_MS = 200;

const STATS = [
  {
    id: 1,
    icon: "/images/landing-stats-1.png",
    number: "1,700+",
    text: "رستوران ثبت شده",
  },
  {
    id: 2,
    icon: "/images/landing-stats-2.png",
    number: "69,000+",
    text: "مخاطب فعال",
  },
  {
    id: 3,
    icon: "/images/landing-stats-3.png",
    number: "1,000,000+",
    text: "سفارش های انجام شده",
  },
  {
    id: 4,
    icon: "/images/landing-stats-4.png",
    number: "12,000+",
    text: "اسکن منو",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function parseToNumber(str) {
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  let out = "";
  for (const ch of String(str)) {
    const pi = persian.indexOf(ch);
    const ai = arabic.indexOf(ch);
    if (pi > -1) out += String(pi);
    else if (ai > -1) out += String(ai);
    else if (/\d/.test(ch)) out += ch;
  }
  return Number(out || 0);
}

function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(n);
}

// True once the page (or the app's scroll container) has moved from the top.
function hasScrolled() {
  const container = document.querySelector(".app-shell__content");
  return (
    (window.scrollY || 0) > 0 ||
    (document.documentElement.scrollTop || 0) > 0 ||
    (container ? container.scrollTop > 0 : false)
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function StatsSection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const [startAnimation, setStartAnimation] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // 1. Prime the numbers to 0 before the first paint, so the final values
  //    never flash on screen. Skipped for reduced motion (numbers stay final).
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || section.__primed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    section.__primed = true;

    section.querySelectorAll(".stat-number").forEach((el) => {
      const original = (el.textContent || "").trim();
      el.dataset.targetText = original;
      const plusStart = /^[+\uFF0B]/.test(original);
      const plusEnd = /[+\uFF0B]$/.test(original);
      el.dataset.plusStart = plusStart ? "1" : "0";
      el.dataset.plusEnd = plusEnd ? "1" : "0";
      el.textContent = plusStart ? "+0" : plusEnd ? "0+" : "0";
    });
  }, []);

  // 2. Decide WHEN to start: the stats row is really on screen and the
  //    user has scrolled. Re-checked on every scroll / resize, so a brief
  //    intersection while the page is still loading can't use it up.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || startAnimation) return;

    let timer = 0;
    let raf = 0;

    const isInView = () => {
      const r = container.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * START_AT_VIEWPORT && r.bottom > vh * 0.1;
    };

    const check = () => {
      raf = 0;

      if (isInView() && hasScrolled()) {
        if (!timer) {
          timer = window.setTimeout(() => {
            timer = 0;
            if (isInView()) setStartAnimation(true);
          }, CONFIRM_MS);
        }
      } else if (timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };

    // capture: true also catches scrolling inside .app-shell__content
    window.addEventListener("scroll", schedule, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
    };
  }, [startAnimation]);

  // 3. Count-up: runs once, only after startAnimation becomes true
  useEffect(() => {
    if (!startAnimation) return;

    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const rafs = [];

    section.querySelectorAll(".stat-number").forEach((el, i) => {
      const targetText = el.dataset.targetText || (el.textContent || "").trim();
      if (reduced) {
        el.textContent = targetText;
        return;
      }

      const plusStart = el.dataset.plusStart === "1";
      const plusEnd = el.dataset.plusEnd === "1";
      const target = parseToNumber(targetText);
      const startAt = performance.now() + i * STAGGER_MS;

      const tick = (now) => {
        if (!el.isConnected) return;

        if (now < startAt) {
          rafs[i] = requestAnimationFrame(tick);
          return;
        }

        const t = Math.min(1, (now - startAt) / COUNT_DURATION_MS);
        const eased = 1 - Math.pow(1 - t, 2); // easeOutQuad (steady, no long crawl at the end)
        const pretty = formatNumber(Math.round(target * eased));

        el.textContent = plusStart
          ? `+${pretty}`
          : plusEnd
            ? `${pretty}+`
            : pretty;

        if (t < 1) {
          rafs[i] = requestAnimationFrame(tick);
        } else {
          el.textContent = targetText; // exact original text at the end
        }
      };

      rafs[i] = requestAnimationFrame(tick);
    });

    return () => rafs.forEach((id) => id && cancelAnimationFrame(id));
  }, [startAnimation]);

  // 4. Cursor-repel on icons (unchanged)
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobile = window.matchMedia("(max-width: 768px)");

    if (reducedMotion.matches || isMobile.matches) return;
    const ICON_SEL = ".stat-icon";
    const icons = Array.from(root.querySelectorAll(ICON_SEL));

    const states = new Map(); // per icon: { tx, ty, targetX, targetY, raf, rect }
    const maxShift = 40; // px, tweak strength here
    const lerpAlpha = 0.18; // smoothing (0..1), lower = smoother

    function ensureState(el) {
      if (!states.has(el)) {
        states.set(el, {
          tx: 0,
          ty: 0,
          targetX: 0,
          targetY: 0,
          raf: 0,
          rect: el.getBoundingClientRect(),
        });
      }
      return states.get(el);
    }

    function onPointerEnter(e) {
      const el = e.currentTarget;
      const st = ensureState(el);
      st.rect = el.getBoundingClientRect();
    }

    function onPointerMove(e) {
      const el = e.currentTarget;
      const st = ensureState(el);

      const r = st.rect;
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      // normalize (-1..1) relative to center
      const nx = (x / r.width) * 2 - 1;
      const ny = (y / r.height) * 2 - 1;

      // move opposite to cursor direction
      st.targetX = -nx * maxShift;
      st.targetY = -ny * maxShift;

      if (!st.raf) st.raf = requestAnimationFrame(() => animate(el));
    }

    function onPointerLeave(e) {
      const el = e.currentTarget;
      const st = ensureState(el);
      st.targetX = 0;
      st.targetY = 0;
      if (!st.raf) st.raf = requestAnimationFrame(() => animate(el));
    }

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

    icons.forEach((el) => {
      el.style.setProperty("perspective", "600px");
      el.addEventListener("pointerenter", onPointerEnter);
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerleave", onPointerLeave);
    });

    // keep rects fresh on resize/scroll
    const ro = new ResizeObserver(() => {
      icons.forEach((el) => {
        const st = ensureState(el);
        st.rect = el.getBoundingClientRect();
      });
    });
    icons.forEach((el) => ro.observe(el));

    const onScroll = () => {
      icons.forEach((el) => {
        const st = ensureState(el);
        st.rect = el.getBoundingClientRect();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      icons.forEach((el) => {
        el.removeEventListener("pointerenter", onPointerEnter);
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerleave", onPointerLeave);
        const img = el.querySelector("img");
        if (img) img.style.transform = "";
      });
      states.clear();
    };
  }, []);

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="stats-container" ref={containerRef}>
        {STATS.map((stat, i) => {
          const showNumber = startAnimation || reducedMotion;

          return (
          <div key={stat.id} className="stat-item">
            <div className="stat-icon" data-shift="16">
              <img src={stat.icon} alt={`Stat ${stat.id}`} draggable="false" />
            </div>

            {/* Wrapper locks layout width so the number doesn't jitter.
                It stays invisible until the section is reached, then fades
                in at the same moment its count starts. */}
            <div
              className="stat-number-wrapper"
              style={{
                display: "grid",
                justifyContent: "center",
                opacity: showNumber ? 1 : 0,
                transform: showNumber ? "translateY(0)" : "translateY(14px)",
                transition: reducedMotion
                  ? "none"
                  : `opacity ${REVEAL_MS}ms ease-out ${i * STAGGER_MS}ms, transform ${REVEAL_MS}ms ease-out ${i * STAGGER_MS}ms`,
              }}
            >
              {/* Invisible placeholder takes up the exact final width */}
              <div
                aria-hidden="true"
                style={{ visibility: "hidden", gridArea: "1 / 1" }}
              >
                {stat.number}
              </div>
              {/* Actual animating element laid on top */}
              <div
                className="stat-number"
                style={{
                  gridArea: "1 / 1",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {stat.number}
              </div>
            </div>

            <div className="stat-text">{stat.text}</div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
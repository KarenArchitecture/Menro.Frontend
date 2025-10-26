import React, { useRef, useEffect } from "react";

export default function StatsSection() {
  const sectionRef = useRef(null);

  const stats = [
    {
      id: 1,
      icon: "/images/landing-stats-1.png",
      number: "+1,700",
      text: "رستوران ثبت شده",
    },
    {
      id: 2,
      icon: "/images/landing-stats-2.png",
      number: "+69,000",
      text: "مخاطب فعال",
    },
    {
      id: 3,
      icon: "/images/landing-stats-3.png",
      number: "+1,000,000",
      text: "سفارش های انجام شده",
    },
    {
      id: 4,
      icon: "/images/landing-stats-4.png",
      number: "+12,000",
      text: "اسکن منو",
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || section.__counted) return; // StrictMode guard
    section.__counted = true;

    const nums = section.querySelectorAll(".stat-number");

    // prime to 0 and stash target/+ position
    nums.forEach((el) => {
      const original = (el.textContent || "").trim();
      el.dataset.targetText = original;
      const plusStart = /^[+\uFF0B]/.test(original);
      const plusEnd = /[+\uFF0B]$/.test(original);
      el.dataset.plusStart = plusStart ? "1" : "0";
      el.dataset.plusEnd = plusEnd ? "1" : "0";
      el.textContent = plusStart ? "+0" : plusEnd ? "0+" : "0";
    });

    // count once
    nums.forEach((el, i) => {
      const targetText = el.dataset.targetText || "0";
      const plusStart = el.dataset.plusStart === "1";
      const plusEnd = el.dataset.plusEnd === "1";
      const target = parseToNumber(targetText);

      const duration = 10000; // ms
      const delay = i * 80; // small stagger
      const startAt = performance.now() + delay;

      const tick = (now) => {
        if (!el.isConnected) return;
        if (now < startAt) return requestAnimationFrame(tick);

        const t = Math.min(1, (now - startAt) / duration);
        const eased = 1 - Math.pow(1 - t, 2); // easeOutQuad
        const value = Math.round(target * eased);
        const pretty = formatNumber(value);

        el.textContent = plusStart
          ? `+${pretty}`
          : plusEnd
          ? `${pretty}+`
          : pretty;
        if (t < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  }, []);

  // === Cursor-repel on icons ===
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const ICON_SEL = ".stat-icon";
    const icons = Array.from(root.querySelectorAll(ICON_SEL));

    const states = new Map(); // per icon: { tx, ty, targetX, targetY, raf, rect }
    const maxShift = 16; // px — tweak strength here
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

      // position inside the icon
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

      // lerp towards target
      st.tx += (st.targetX - st.tx) * lerpAlpha;
      st.ty += (st.targetY - st.ty) * lerpAlpha;

      // snap small values to zero
      if (Math.abs(st.tx) < 0.05) st.tx = 0;
      if (Math.abs(st.ty) < 0.05) st.ty = 0;

      // apply transform to the IMG (so layout box stays stable)
      const img = el.querySelector("img");
      if (img) img.style.transform = `translate(${st.tx}px, ${st.ty}px)`;

      // continue animating while not at rest
      if (st.tx !== st.targetX || st.ty !== st.targetY) {
        st.raf = requestAnimationFrame(() => animate(el));
      } else {
        st.raf = 0;
      }
    }

    // attach listeners
    icons.forEach((el) => {
      el.style.setProperty("perspective", "600px"); // harmless, future-proof if you add tilt
      el.addEventListener("pointerenter", onPointerEnter);
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerleave", onPointerLeave);
    });

    // keep rects fresh on resize/scroll (optional)
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

    // cleanup
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

  // helpers
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

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="stats-container">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-item">
            <div className="stat-icon" data-shift="16">
              <img src={stat.icon} alt={`Stat ${stat.id}`} draggable="false" />
            </div>
            <div className="stat-number">{stat.number}</div>
            <div className="stat-text">{stat.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

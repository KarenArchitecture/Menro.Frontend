// components/landing/BlogsSection.jsx
import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
} from "react";
import gsap from "gsap";

import ClockIcon from "../icons/ClockIcon";
import ArrowUpIcon from "../icons/ArrowUpIcon";
import NextIcon from "../icons/NextIcon";
import PrevIcon from "../icons/PrevIcon";

/** Demo data (swap with API later) */
const DEFAULT_POSTS = [
  {
    id: "p1",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blog-(1).png",
    readingMins: 30,
  },
  {
    id: "p2",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blog-(2).png",
    readingMins: 30,
  },
  {
    id: "p3",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blog-(3).png",
    readingMins: 30,
  },
  {
    id: "p4",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blog-(4).png",
    readingMins: 12,
  },
  {
    id: "p5",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blog-(1).png",
    readingMins: 30,
  },
  {
    id: "p6",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blog-(2).png",
    readingMins: 30,
  },
  {
    id: "p7",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blog-(3).png",
    readingMins: 30,
  },
  {
    id: "p8",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blog-(4).png",
    readingMins: 12,
  },
];

/** Card */
function BlogCard({ post }) {
  const { title, href, coverSrc, readingMins } = post;
  return (
    <li className="blogs__card" role="listitem">
      <a
        className="blogs__card-link"
        href={href}
        aria-label={`خواندن: ${title}`}
      >
        <img
          className="blogs__card-img"
          src={coverSrc}
          alt=""
          loading="lazy"
          width="360"
          height="450"
          decoding="async"
        />
        <div className="blogs__card-overlay" />
        <div className="blogs__card-meta">
          <h3 className="blogs__card-title">{title}</h3>
          <div className="blogs__card-info">
            <ClockIcon />
            <span className="blogs__mins">{readingMins} دقیقه</span>
          </div>
        </div>
      </a>
    </li>
  );
}

/** Wrap last occurrence of token with span */
function HighlightedChunk({
  text,
  token,
  accentClass = "blogs__marquee-accent",
}) {
  const idx = text.lastIndexOf(token);
  if (idx === -1) return <span className="blogs__marquee-chunk">{text}</span>;
  const before = text.slice(0, idx).trimEnd();
  const after = text.slice(idx + token.length);
  return (
    <span className="blogs__marquee-chunk">
      {before && <>{before} </>}
      <span className={accentClass}>{token}</span>
      {after && <> {after}</>}
    </span>
  );
}

export default function BlogSection({
  posts = DEFAULT_POSTS,
  allHref = "#",
  sectionTitle = "بلاگ‌ها منرو",
  highlightWord = "منرو",
}) {
  const railRef = useRef(null);
  const marqueeRef = useRef(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const marqueeChunk = useMemo(
    () => <HighlightedChunk text={sectionTitle} token={highlightWord} />,
    [sectionTitle, highlightWord]
  );

  /** ------- GSAP marquee: continuous belt, no reset ------- */
  useLayoutEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mql?.matches) return;

    const ctx = gsap.context(() => {
      const root = marqueeRef.current;
      if (!root) return;

      const track = root.querySelector(".blogs__marquee-track");
      const rowA = track?.querySelector(".blogs__marquee-row");
      if (!track || !rowA) return;

      // Ensure two identical rows exist (for wrap)
      if (track.children.length < 2) {
        const clone = rowA.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }

      gsap.set(track, { x: 0, force3D: true });

      const SPEED = 90; // px/sec
      let rowW = 0;
      let x = 0;

      const measure = () => {
        // subpixel width for accuracy
        rowW = rowA.getBoundingClientRect().width || rowA.offsetWidth || 0;
      };

      const wrap = (val) => {
        if (!rowW) return val;
        let r = val % -rowW; // keep in (-rowW..0]
        if (r > 0) r -= rowW;
        return r;
      };

      const rebuild = () => {
        measure();
        x = wrap(x);
        gsap.set(track, { x });
      };

      // Start measurable ASAP and after fonts/resize
      measure();
      rebuild();
      const raf = requestAnimationFrame(rebuild);
      if (document.fonts?.ready) document.fonts.ready.then(rebuild);

      const ro = new ResizeObserver(rebuild);
      ro.observe(rowA);

      // GSAP ticker: deltaTime is in **milliseconds** (per docs)
      const tick = (_time, deltaMS) => {
        const dt = (typeof deltaMS === "number" ? deltaMS : 16.6667) / 1000; // sec
        if (!rowW) {
          measure();
          if (!rowW) return;
        }
        x = wrap(x - SPEED * dt);
        gsap.set(track, { x });
      };
      gsap.ticker.add(tick); // runs with requestAnimationFrame. :contentReference[oaicite:1]{index=1}

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        gsap.ticker.remove(tick);
      };
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  /** ------- Rail controls (step = card width + CSS gap) ------- */
  const getStep = () => {
    const rail = railRef.current;
    if (!rail) return 0;
    const firstCard = rail.querySelector(".blogs__card");
    if (!firstCard) return 0;
    const rect = firstCard.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(rail).gap || "0");
    return rect.width + (isNaN(gap) ? 0 : gap);
  };

  const updateButtons = () => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const sl = el.scrollLeft;
    setCanPrev(sl > 0);
    setCanNext(sl < max - 1);
  };

  const scrollBy = (delta) =>
    railRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  const onPrev = () => scrollBy(-(getStep() || 0));
  const onNext = () => scrollBy(getStep() || 0);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const onResize = () => updateButtons();
    window.addEventListener("resize", onResize);
    const onLoad = (e) => {
      if (e.target && e.target.classList?.contains("blogs__card-img"))
        updateButtons();
    };
    el.addEventListener("load", onLoad, true);
    const raf = requestAnimationFrame(updateButtons);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("load", onLoad, true);
    };
  }, []);

  return (
    <section className="blogs" dir="rtl" aria-labelledby="blogs-title">
      <h2 id="blogs-title" className="sr-only">
        {sectionTitle}
      </h2>

      {/* Marquee */}
      <div className="blogs__marquee" aria-hidden="true" ref={marqueeRef}>
        <div className="blogs__marquee-track">
          {/* Row A */}
          <div className="blogs__marquee-row">
            {Array.from({ length: 8 }).map((_, i) => (
              <React.Fragment key={`A-${i}`}>
                {marqueeChunk}
                <span aria-hidden="true">&nbsp;&nbsp;</span>
              </React.Fragment>
            ))}
          </div>
          {/* Row B (duplicate for wrap) */}
          <div className="blogs__marquee-row" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <React.Fragment key={`B-${i}`}>
                {marqueeChunk}
                <span aria-hidden="true">&nbsp;&nbsp;</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Rail + controls */}
      <div className="blogs__viewport">
        <ul
          className="blogs__rail"
          ref={railRef}
          role="list"
          onScroll={updateButtons}
        >
          {posts.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
        </ul>

        <div className="blogs__controls">
          <a className="blogs__all btn btn-ghost" href={allHref}>
            <ArrowUpIcon />
            <span className="blogs__all-link">مشاهده همه مقالات</span>
          </a>
          <div className="blogs__nav">
            <button
              type="button"
              className="blogs__arrow"
              onClick={onNext}
              aria-label="اسلاید بعدی"
              disabled={!canNext}
            >
              <NextIcon />
            </button>
            <button
              type="button"
              className="blogs__arrow blogs__arrow--prev"
              onClick={onPrev}
              aria-label="اسلاید قبلی"
              disabled={!canPrev}
            >
              <PrevIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

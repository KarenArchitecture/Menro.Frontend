// components/landing/BlogsSection.jsx
import React, { useRef, useState, useMemo, useEffect } from "react";

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

/** Single blog card */
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

/** Utility: wrap the last occurrence of a token with a span */
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

/** Main Blogs section with scroll-snap rail and controls */
export default function BlogSection({
  posts = DEFAULT_POSTS,
  allHref = "#",
  sectionTitle = "بلاگ‌ها منرو",
  highlightWord = "منرو", // word to colorize inside the marquee
}) {
  const railRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const cardWidth = 360; // keep in sync with CSS later

  const updateButtons = () => {
    const el = railRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 0);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const onPrev = () =>
    railRef.current?.scrollBy({ left: -(cardWidth + 24), behavior: "smooth" });
  const onNext = () =>
    railRef.current?.scrollBy({ left: cardWidth + 24, behavior: "smooth" });

  useEffect(() => {
    updateButtons();
    const el = railRef.current;
    if (!el) return;
    const onResize = () => updateButtons();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Build one marquee chunk with <span> wrapping the accent word
  const marqueeChunk = useMemo(
    () => <HighlightedChunk text={sectionTitle} token={highlightWord} />,
    [sectionTitle, highlightWord]
  );

  return (
    <section className="blogs" dir="rtl" aria-labelledby="blogs-title">
      <h2 id="blogs-title" className="sr-only">
        {sectionTitle}
      </h2>

      {/* Top oversized marquee (decorative) */}
      <div className="blogs__marquee" aria-hidden="true">
        <div className="blogs__marquee-row">
          {Array.from({ length: 8 }).map((_, i) => (
            <React.Fragment key={i}>
              {marqueeChunk}
              <span aria-hidden="true">&nbsp;&nbsp;</span>
            </React.Fragment>
          ))}
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

        {/* Bottom controls */}
        <div className="blogs__controls">
          <button className="blogs__all btn btn-ghost">
            <ArrowUpIcon />
            <a className="blogs__all-link" l href={allHref}>
              مشاهده همه مقالات
            </a>
          </button>

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

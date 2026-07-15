// components/landing/BlogsSection.jsx
import React, { useRef, useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Marquee from "react-fast-marquee";

import ClockIcon from "../icons/ClockIcon";
import ArrowUpIcon from "../icons/ArrowUpIcon";
import NextIcon from "../icons/NextIcon";
import PrevIcon from "../icons/PrevIcon";

/**
 * Demo data - only used when this component is rendered without a `posts`
 * prop at all (e.g. in isolation/storybook). In the real landing page,
 * LandingPage.jsx fetches real posts via getBlogPosts() from api/blogs.js
 * and passes them in as `posts` (raw BlogPostResponse[] shape).
 */
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

/* ---------------------------------- */
/* Cursor follower (pill)             */
/* ---------------------------------- */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function BlogCursorFollower({ targetEl, offsetY = -5 }) {
  const hostRef = useRef(null);
  const pos = useRef({ x: -9999, y: -9999 });
  const aim = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  useEffect(() => {
    const host = hostRef.current;
    const section = targetEl?.current;
    if (!host || !section) return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    const hasFinePointer =
      window.matchMedia?.("(pointer: fine)")?.matches ?? true;
    if (!hasFinePointer) return; // skip touch/coarse pointers

    const onEnter = () => {
      host.style.opacity = "1";
    };
    const onLeave = () => {
      host.style.opacity = "0";
    };
    const onMove = (e) => {
      aim.current.x = e.clientX;
      aim.current.y = e.clientY + offsetY;
      if (host.style.opacity === "0") {
        pos.current.x = aim.current.x;
        pos.current.y = aim.current.y;
      }
    };

    const tick = () => {
      const t = prefersReduced ? 1 : 0.18;
      pos.current.x = lerp(pos.current.x, aim.current.x, t);
      pos.current.y = lerp(pos.current.y, aim.current.y, t);
      host.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mouseleave", onLeave);
    section.addEventListener("mousemove", onMove, { passive: true });

    host.style.opacity = "0";
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mouseleave", onLeave);
      section.removeEventListener("mousemove", onMove);
    };
  }, [targetEl, offsetY]);

  return createPortal(
    <div
      ref={hostRef}
      className="blog-cursor-follower"
      aria-hidden="true"
      role="presentation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: "none",
        transform: "translate3d(-9999px,-9999px,0)",
        transition: "opacity 180ms ease",
      }}
    >
      <div
        className="blog-cursor-pill"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: ".8rem 1.4rem",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,.14)",
          background: "rgba(14,16,20,.72)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 4px 22px rgba(0,0,0,.35)",
          fontSize: "1.35rem",
          color: "#e9eef5",
          transform: "translate(-50%,-100%)",
          whiteSpace: "nowrap",
        }}
      >
        <span className="label">برای اسکرول بکشید</span>
        <div className="landing-blog-scroll">
          <img
            src="/images/landing-blog-scroll-bar.svg"
            alt="scroll indicator for blogs"
          />
          <img
            src="/images/landing-blog-scroll-ball.svg"
            alt="scroll indicator for blogs"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Used when a post has no cover image yet.
const BLOG_COVER_FALLBACK = "/images/blog-placeholder.png";

/**
 * Maps a raw BlogPostResponse (see BlogPostDtos.cs) coming from
 * getBlogPosts() to the flat shape BlogCard expects.
 *
 * NOTE: BlogPostResponse has no slug field, so the read link is built from
 * the post id (`/blog/{id}`). Adjust `hrefBase` if the real post route uses
 * a slug instead.
 */
function mapPostToCard(post, hrefBase = "/blog") {
  return {
    id: post.id,
    title: post.title,
    href: `${hrefBase}/${post.id}`,
    coverSrc: post.coverImageUrl || BLOG_COVER_FALLBACK,
    readingMins: post.readingMinutes,
  };
}

/** Card */
function BlogCard({ post }) {
  const { title, href, coverSrc, readingMins } = post;
  return (
    <li className="blogs__card" role="listitem">
      <a
        className="blogs__card-link"
        href={href}
        aria-label={`خواندن: ${title}`}
        draggable="false" // <--- PREVENTS BROWSER GHOST DRAGGING
      >
        <img
          className="blogs__card-img"
          src={coverSrc}
          alt=""
          loading="lazy"
          width="360"
          height="450"
          decoding="async"
          draggable="false" // <--- PREVENTS BROWSER GHOST DRAGGING
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

/**
 * Placeholder shown in the rail while posts are being fetched. Uses inline
 * styles on purpose - styles-landing.css wasn't provided, so this doesn't
 * assume any `.blogs__card--skeleton` rule exists there. Feel free to move
 * this into the stylesheet and simplify once it does.
 */
function BlogCardSkeleton() {
  return (
    <li className="blogs__card" role="listitem" aria-hidden="true">
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "inherit",
          background:
            "linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.12) 37%, rgba(255,255,255,.06) 63%)",
          backgroundSize: "400% 100%",
          animation: "blogs-skeleton-pulse 1.4s ease infinite",
        }}
      />
      <style>{`
        @keyframes blogs-skeleton-pulse {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
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
  // undefined -> standalone/dev usage, falls back to demo posts.
  // null      -> real page is still fetching from getBlogPosts().
  // []        -> fetch succeeded but there are no published posts yet.
  // [...]     -> real posts, mapped from raw BlogPostResponse[] below.
  posts,
  hrefBase = "/blog",
  allHref = "/blog",
  sectionTitle = "بلاگ‌ها منرو",
  highlightWord = "منرو",
}) {
  const isDevFallback = posts === undefined;
  const isLoading = posts === null;
  const rawPosts = isDevFallback ? DEFAULT_POSTS : posts || [];
  const cards = isDevFallback
    ? rawPosts // already in the {id, title, href, coverSrc, readingMins} shape
    : rawPosts.map((p) => mapPostToCard(p, hrefBase));

  const railRef = useRef(null);
  const sectionRef = useRef(null);

  // Dragging Refs
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [playMarquee, setPlayMarquee] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mql?.matches) setPlayMarquee(false);
  }, []);

  const marqueeChunk = useMemo(
    () => <HighlightedChunk text={sectionTitle} token={highlightWord} />,
    [sectionTitle, highlightWord],
  );

  /** ------- Rail controls ------- */
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
    // In RTL, scrollLeft is usually negative in modern browsers, starting at 0.
    // We check absolute values to easily toggle button states.
    const max = el.scrollWidth - el.clientWidth;
    const sl = Math.abs(el.scrollLeft);
    setCanPrev(sl > 0);
    setCanNext(sl < max - 1);
  };

  const scrollByAmount = (delta) =>
    railRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  const onPrev = () => scrollByAmount(-(getStep() || 0));
  const onNext = () => scrollByAmount(getStep() || 0);

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

  // Fetch succeeded but there's nothing published yet - nothing useful to
  // show, so skip rendering the section entirely rather than showing an
  // empty rail + marquee.
  if (!isDevFallback && !isLoading && cards.length === 0) {
    return null;
  }

  return (
    <section
      className="blogs"
      dir="rtl"
      aria-labelledby="blogs-title"
      ref={sectionRef}
      style={{ cursor: "pointer" }}
    >
      <BlogCursorFollower targetEl={sectionRef} />

      <h2 id="blogs-title" className="sr-only">
        {sectionTitle}
      </h2>

      <div className="blogs__marquee" aria-hidden="true" dir="ltr">
        <div className="marquee__track" style={{ "--dur": "22s" }}>
          <div className="marquee__row" dir="rtl">
            {Array.from({ length: 8 }).map((_, i) => (
              <span className="marquee__item" key={`A-${i}`}>
                <span className="blogs__marquee-chunk">
                  {sectionTitle.replace(highlightWord, "")}
                  <span className="blogs__marquee-accent">{highlightWord}</span>
                </span>
              </span>
            ))}
          </div>
          <div className="marquee__row" dir="rtl" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <span className="marquee__item" key={`B-${i}`}>
                <span className="blogs__marquee-chunk">
                  {sectionTitle.replace(highlightWord, "")}
                  <span className="blogs__marquee-accent">{highlightWord}</span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="blogs__viewport">
        <ul
          className="blogs__rail"
          ref={railRef}
          role="list"
          onScroll={updateButtons}
          // --- DRAG EVENT HANDLERS ---
          onMouseDown={(e) => {
            isDragging.current = true;
            hasDragged.current = false;
            startX.current = e.pageX - railRef.current.offsetLeft;
            scrollLeftPos.current = railRef.current.scrollLeft;
            railRef.current.style.cursor = "grabbing";
          }}
          onMouseLeave={() => {
            isDragging.current = false;
            if (railRef.current) railRef.current.style.cursor = "grab";
          }}
          onMouseUp={() => {
            isDragging.current = false;
            if (railRef.current) railRef.current.style.cursor = "grab";
          }}
          onMouseMove={(e) => {
            if (!isDragging.current) return;
            e.preventDefault();
            const x = e.pageX - railRef.current.offsetLeft;
            const walk = (x - startX.current) * 1.5; // Scroll-fast multiplier

            // Register as an actual drag only if moved more than 5 pixels
            if (Math.abs(walk) > 5) {
              hasDragged.current = true;
            }

            railRef.current.scrollLeft = scrollLeftPos.current - walk;
          }}
          onClickCapture={(e) => {
            // Stop navigation if they actually dragged the slider
            if (hasDragged.current) {
              e.stopPropagation();
              e.preventDefault();
            }
          }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <BlogCardSkeleton key={`skeleton-${i}`} />
              ))
            : cards.map((p) => <BlogCard key={p.id} post={p} />)}
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

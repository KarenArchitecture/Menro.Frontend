// components/landing/BlogsSection.jsx
import React, { useRef, useState, useMemo } from "react";

/** Demo data (swap with API later) */
const DEFAULT_POSTS = [
  {
    id: "p1",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blogs/post-1.jpg",
    readingMins: 30,
  },
  {
    id: "p2",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blogs/post-2.jpg",
    readingMins: 30,
  },
  {
    id: "p3",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blogs/post-3.jpg",
    readingMins: 30,
  },
  {
    id: "p4",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blogs/post-4.jpg",
    readingMins: 12,
  },
  {
    id: "p5",
    title: "عنوان مقاله",
    href: "#",
    coverSrc: "/images/blogs/post-5.jpg",
    readingMins: 18,
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
            <span className="blogs__dot" aria-hidden="true" />
            <span className="blogs__mins">{readingMins} دقیقه</span>
          </div>
        </div>
      </a>
    </li>
  );
}

/** Main Blogs section with scroll-snap rail and controls */
export default function BlogSection({
  posts = DEFAULT_POSTS,
  allHref = "#",
  sectionTitle = "بلاگ‌های منرو",
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

  const onPrev = () => {
    railRef.current?.scrollBy({ left: -cardWidth - 24, behavior: "smooth" });
  };
  const onNext = () => {
    railRef.current?.scrollBy({ left: cardWidth + 24, behavior: "smooth" });
  };

  const marqueeText = useMemo(
    () => Array.from({ length: 8 }, () => sectionTitle).join("  "),
    [sectionTitle]
  );

  return (
    <section className="blogs" dir="rtl" aria-labelledby="blogs-title">
      <h2 id="blogs-title" className="sr-only">
        {sectionTitle}
      </h2>

      {/* Top oversized marquee (decorative) */}
      <div className="blogs__marquee" aria-hidden="true">
        <div className="blogs__marquee-row">{marqueeText}</div>
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
          <a className="blogs__all btn btn-ghost" href={allHref}>
            مشاهده همه مقالات
          </a>

          <div className="blogs__nav">
            <button
              type="button"
              className="blogs__arrow"
              onClick={onNext}
              aria-label="اسلاید بعدی"
              disabled={!canNext}
            >
              {/* › icon drawn with CSS; keep empty */}
            </button>
            <button
              type="button"
              className="blogs__arrow blogs__arrow--prev"
              onClick={onPrev}
              aria-label="اسلاید قبلی"
              disabled={!canPrev}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

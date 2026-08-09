import { useEffect, useMemo, useRef, useState } from "react";
import {
  processContentForHeadings,
  hydrateRestaurantCards,
} from "../../utils/blogPostContent";

export default function BlogPostBody({ content }) {
  const bodyRef = useRef(null);
  const [activeHeadingId, setActiveHeadingId] = useState(null);

  const { html, headings } = useMemo(
    () => processContentForHeadings(content),
    [content],
  );

  useEffect(() => {
    hydrateRestaurantCards(bodyRef.current);
  }, [html]);

  // Highlights the TOC entry for whichever heading is currently nearest the
  // top of the viewport, so the reader can see where they are in long posts.
  useEffect(() => {
    if (headings.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveHeadingId(visible.target.id);
      },
      { rootMargin: "-100px 0px -70% 0px" },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bp-body-wrapper">
      {headings.length > 1 && (
        <nav className="bp-toc">
          <span className="bp-toc__title">
            <i className="fas fa-list-ul" /> فهرست مطالب
          </span>
          <ul>
            {headings.map((h) => (
              <li
                key={h.id}
                className={`bp-toc__item bp-toc__item--level-${h.level} ${
                  activeHeadingId === h.id ? "bp-toc__item--active" : ""
                }`}
              >
                <button type="button" onClick={() => scrollToHeading(h.id)}>
                  {h.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div
        ref={bodyRef}
        className="bp-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

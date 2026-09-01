import React, { useMemo } from "react";
import "../../assets/css/subscriptions-trusted-brands.css";

// Top row — scrolls left. Exactly 10 real brand logos.
const DEFAULT_TOP_LOGOS = [
  { id: 1, src: "/images/subscriptions/sub-brand-1.png", alt: "برند 1" },
  { id: 2, src: "/images/subscriptions/sub-brand-2.png", alt: "برند 2" },
  { id: 3, src: "/images/subscriptions/sub-brand-3.png", alt: "برند 3" },
  { id: 4, src: "/images/subscriptions/sub-brand-4.png", alt: "برند 4" },
  { id: 5, src: "/images/subscriptions/sub-brand-5.png", alt: "برند 5" },
  { id: 6, src: "/images/subscriptions/sub-brand-6.png", alt: "برند 6" },
  { id: 7, src: "/images/subscriptions/sub-brand-7.png", alt: "برند 7" },
  { id: 8, src: "/images/subscriptions/sub-brand-8.png", alt: "برند 8" },
  { id: 9, src: "/images/subscriptions/sub-brand-9.png", alt: "برند 9" },
  { id: 10, src: "/images/subscriptions/sub-brand-10.png", alt: "برند 10" },
];

// Bottom row — scrolls right. Its own set of 10 (duplicates of the top
// set are fine per your note, or swap in a different 10).
const DEFAULT_BOTTOM_LOGOS = [
  { id: 1, src: "/images/subscriptions/sub-brand-1.png", alt: "برند 1" },
  { id: 2, src: "/images/subscriptions/sub-brand-2.png", alt: "برند 2" },
  { id: 3, src: "/images/subscriptions/sub-brand-3.png", alt: "برند 3" },
  { id: 4, src: "/images/subscriptions/sub-brand-4.png", alt: "برند 4" },
  { id: 5, src: "/images/subscriptions/sub-brand-5.png", alt: "برند 5" },
  { id: 6, src: "/images/subscriptions/sub-brand-6.png", alt: "برند 6" },
  { id: 7, src: "/images/subscriptions/sub-brand-7.png", alt: "برند 7" },
  { id: 8, src: "/images/subscriptions/sub-brand-8.png", alt: "برند 8" },
  { id: 9, src: "/images/subscriptions/sub-brand-9.png", alt: "برند 9" },
  { id: 10, src: "/images/subscriptions/sub-brand-10.png", alt: "برند 10" },
];

/**
 * Repeats `logos` until it has at least `minCount` items, re-keying each
 * copy so React doesn't complain about duplicate keys. minCount should be
 * generous enough that one full set of tiles is comfortably wider than the
 * widest viewport you support — otherwise the viewport could momentarily
 * outrun the content during the loop. 24 tiles at ~136px each (120px tile +
 * 16px effective gap) is ~3260px, safely covering anything up to a large
 * desktop monitor.
 */
function fillRow(logos, minCount) {
  if (!logos?.length) return [];
  const out = [];
  let copy = 0;
  while (out.length < minCount) {
    logos.forEach((logo) => {
      out.push({ ...logo, _key: `${logo.id}-${copy}` });
    });
    copy += 1;
  }
  return out;
}

/**
 * Structured to exactly mirror the working text ticker in
 * components/landing/BlogsSection.jsx (.blogs__marquee > .marquee__track >
 * .marquee__row (x2) > .marquee__item): a single CSS `@keyframes`
 * animation — translateX(0) -> translateX(-50%) — applied to a track that
 * renders the SAME sequence of tiles twice in a row. No JS drives the
 * transform; the browser's own animation timeline handles it, exactly like
 * the blog ticker already does without any snap.
 *
 * All horizontal spacing between tiles comes from padding on each tile
 * (.sub-brands__tile), never from a flex `gap` on the row/track. That's
 * the actual fix: `gap` only sits *between* items (N items => N-1 gaps),
 * so halving an even-length track's total width also halves an *odd* gap
 * count — a half-gap mismatch between the assumed loop distance and the
 * true one. That mismatch is what produced the "replay/snap" every cycle,
 * in every earlier version of this component (including the ones that
 * mixed `gap` with a trailing `padding-inline-end` "patch"). Padding on
 * every tile, including the last one, sidesteps the arithmetic entirely —
 * duplicating a row and shifting by exactly half the track's rendered
 * width is always exact, regardless of tile count or parity.
 */
function MarqueeRow({
  logos,
  direction = "left",
  minTiles = 24,
  duration = 42,
}) {
  const items = useMemo(() => fillRow(logos, minTiles), [logos, minTiles]);
  if (!items.length) return null;

  return (
    <div className="sub-brands__lane">
      <div
        className={`sub-brands__track sub-brands__track--${direction}`}
        dir="ltr"
        style={{ "--sub-brands-duration": `${duration}s` }}
      >
        {[0, 1].map((copyIndex) => (
          <div
            className="sub-brands__row"
            key={copyIndex}
            aria-hidden={copyIndex === 1}
          >
            {items.map((logo) => (
              <div
                key={`${logo._key}-${copyIndex}`}
                className="sub-brands__tile"
              >
                <img
                  src={logo.src}
                  alt={copyIndex === 0 ? logo.alt : ""}
                  loading="lazy"
                  draggable="false"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SubscriptionsTrustedBrands({
  title = "منرو، مورد اعتماد برترین برند‌ها",
  subtitle = "بهترین گزینه برای شروع و بررسی تمام ماژول‌های منرو",
  topLogos = DEFAULT_TOP_LOGOS,
  bottomLogos = DEFAULT_BOTTOM_LOGOS,
}) {
  return (
    <section className="sub-brands">
      <h2 className="sub-brands__title">{title}</h2>
      <p className="sub-brands__subtitle">{subtitle}</p>

      {/* Two fully independent lanes — separate elements, separate CSS
          animations, nothing shared or synchronized beyond both starting
          the instant they mount. */}
      <div className="sub-brands__marquee">
        <MarqueeRow logos={topLogos} direction="left" />
        <MarqueeRow logos={bottomLogos} direction="right" />
      </div>
    </section>
  );
}

import React, { useMemo } from "react";
import "../../assets/css/subscriptions/subscriptions-trusted-brands.css";

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
 * copy so React doesn't complain about duplicate keys.
 */
function fillRow(logos, minCount) {
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

function MarqueeRow({ logos, direction = "left", minTiles = 20, speed = 40 }) {
  // Build one full lap of tiles, then duplicate it once so the track can
  // loop seamlessly from -50% back to 0 — the two halves are pixel-identical,
  // so the instant the first half fully exits, the second half is already
  // sitting exactly where it was, with zero gap.
  const lap = useMemo(() => fillRow(logos, minTiles), [logos, minTiles]);
  const track = useMemo(
    () => [
      ...lap.map((l) => ({ ...l, _key: `${l._key}-a` })),
      ...lap.map((l) => ({ ...l, _key: `${l._key}-b` })),
    ],
    [lap],
  );

  return (
    <div className={`sub-brands__row sub-brands__row--${direction}`}>
      <div
        className="sub-brands__row-track"
        dir="ltr"
        style={{ animationDuration: `${speed}s` }}
      >
        {track.map((logo) => (
          <div key={logo._key} className="sub-brands__tile">
            <img src={logo.src} alt={logo.alt} loading="lazy" />
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

      <div className="sub-brands__marquee">
        <MarqueeRow logos={topLogos} direction="left" />
        <MarqueeRow logos={bottomLogos} direction="right" />
      </div>
    </section>
  );
}

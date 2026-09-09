import React, { useMemo } from "react";
import "../../assets/css/subscriptions-trusted-brands.css";

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
      {/* Text constrained so it doesn't hit mobile edges */}
      <div className="sub-brands__header">
        <h2 className="sub-brands__title">{title}</h2>
        <p className="sub-brands__subtitle">{subtitle}</p>
      </div>

      {/* Marquee stretched edge-to-edge safely */}
      <div className="sub-brands__marquee">
        <MarqueeRow logos={topLogos} direction="left" />
        <MarqueeRow logos={bottomLogos} direction="right" />
      </div>
    </section>
  );
}

// src/components/landing/PlanCard.jsx
import React from "react";
import GreenCheckIcon from "../icons/GreenCheckIcon";

/**
 * Presentational card for a single plan.
 *
 * Expects a plan from plans.js:
 *   { title, description, bgSrc, features, badge, ctaLabel, ctaHref,
 *     accent, hue, recolor }
 *
 * Theme fields become CSS variables on the card root:
 *   --plan-accent : color for chip, check icons, border, glow
 *   --plan-hue    : hue-rotate angle applied to the shared background image
 *   data-recolor  : "true"  -> CSS recolors the image with --plan-hue
 *                   "false" -> plan has its own image, shown untouched
 */

const SECONDS_PER_FEATURE = 3;
const MIN_SCROLL_SECONDS = 12;

function FeatureItem({ text, hidden = false }) {
  return (
    <li className="plan-card__feature" aria-hidden={hidden || undefined}>
      <span>{text}</span>
      <GreenCheckIcon aria-hidden="true" className="plan-card__feature-icon" />
    </li>
  );
}

export default function PlanCard({ plan }) {
  const {
    title,
    description,
    bgSrc,
    features = [],
    accent = "#029dfb",
    hue = 0,
    recolor = true,
    badge = "• اشتراک‌های منرو",
    ctaLabel = "اطلاعات بیشتر",
    ctaHref = "#",
  } = plan ?? {};

  const hasFeatures = features.length > 0;
  const scrollSeconds = Math.max(
    MIN_SCROLL_SECONDS,
    features.length * SECONDS_PER_FEATURE,
  );

  return (
    <div
      className="plan-card"
      data-recolor={recolor ? "true" : "false"}
      style={{
        "--plan-accent": accent,
        "--plan-hue": `${hue}deg`,
      }}
    >
      {/* Background image per plan. If the path is wrong or missing, the
          image hides itself and the card's solid dark background shows. */}
      {bgSrc && (
        <img
          className="plan-card__bg"
          src={bgSrc}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="eager"
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}

      <div className="plan-card__content">
        {/* Info (RTL: right side) */}
        <div className="plan-card__info">
          {badge && <span className="plan-card__chip">{badge}</span>}
          <h2 className="plan-card__title">{title}</h2>
          {description && <p className="plan-card__subtitle">{description}</p>}
          <div className="plan-card__actions">
            <a className="btn btn-light" href={ctaHref}>
              {ctaLabel}
            </a>
          </div>
        </div>

        {/* Features (RTL: left side), infinite auto-scroll */}
        {hasFeatures && (
          <div className="plan-card__features-wrapper">
            <ul
              className="plan-card__features plan-card__features--autoscroll"
              style={{ animationDuration: `${scrollSeconds}s` }}
              aria-label={`امکانات ${title}`}
            >
              {/* Real list, read by screen readers */}
              {features.map((f, i) => (
                <FeatureItem key={`orig-${i}`} text={f} />
              ))}

              {/* Visual copy so translateY(-50%) loops seamlessly */}
              {features.map((f, i) => (
                <FeatureItem key={`dup-${i}`} text={f} hidden />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
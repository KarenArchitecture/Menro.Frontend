import React from "react";
import GreenCheckIcon from "../icons/GreenCheckIcon";

/**
 * Presentational card for a single plan.
 * Expects: { title, description, bgSrc, features?, badge?, ctaLabel?, ctaHref? }
 */
export default function PlanCard({ plan }) {
  const {
    title,
    description,
    bgSrc,
    features = [],
    badge = "اشتراک‌های منرو •",
    ctaLabel = "اطلاعات بیشتر",
    ctaHref = "#",
  } = plan ?? {};

  return (
    <div className="plan-card">
      {/* Background image per plan */}
      <img
        className="plan-card__bg"
        src={bgSrc}
        alt=""
        decoding="async"
        loading="lazy"
        aria-hidden="true"
      />

      <div className="plan-card__content">
        {/* Info (RTL on the right) */}
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

        {/* Features (optional, on the left) */}
        {features?.length > 0 && (
          <div className="plan-card__features-wrapper">
            <ul className="plan-card__features" aria-label={`امکانات ${title}`}>
              {/* 1st Render: Original Features */}
              {features.map((f, i) => (
                <li key={`orig-${i}`} className="plan-card__feature">
                  <span>{f}</span>
                  <GreenCheckIcon
                    aria-hidden="true"
                    className="plan-card__feature-icon"
                  />
                </li>
              ))}

              {/* 2nd Render: Duplicated for seamless infinite scrolling */}
              {features.map((f, i) => (
                <li
                  key={`dup-${i}`}
                  className="plan-card__feature"
                  aria-hidden="true"
                >
                  <span>{f}</span>
                  <GreenCheckIcon
                    aria-hidden="true"
                    className="plan-card__feature-icon"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

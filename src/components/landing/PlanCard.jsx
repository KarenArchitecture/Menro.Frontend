// start code
import React from "react";
import GreenCheckIcon from "../icons/GreenCheckIcon";
/**
 * Presentational card for a single plan.
 * Expects: { title, description, bgSrc, features?, badge?, ctaLabel?, ctaHref? }
 */
export default function PlanCard({
  plan,
  checkIconSrc = "../icons/GreenCheckIcon.jsx",
}) {
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
      <img className="plan-card__bg" src={bgSrc} alt="" decoding="async" />

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
          <ul className="plan-card__features" aria-label={`امکانات ${title}`}>
            {features.map((f, i) => (
              <li key={i} className="plan-card__feature">
                <GreenCheckIcon
                  aria-hidden="true"
                  className="plan-card__feature-icon"
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

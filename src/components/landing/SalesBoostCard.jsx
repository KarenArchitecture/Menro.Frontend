import React from "react";

export default function SalesBoostCard({
  value = 200,
  subtitle = "افزایش فروش",
  className = "",
}) {
  return (
    <div className={`why-card sales-boost ${className}`}>
      <div className="sales-boost__ring">
        {/* placeholder ring; we'll animate the stroke later */}
        <svg className="ring-svg" viewBox="0 0 100 100" aria-hidden>
          <circle className="ring-bg" cx="50" cy="50" r="42" />
          <circle className="ring-fg" cx="50" cy="50" r="42" />
        </svg>
        <div className="sales-boost__content">
          <div className="icon" aria-hidden>
            📊
          </div>
          <div className="value">+{value}%</div>
          <div className="subtitle">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

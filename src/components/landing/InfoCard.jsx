import React from "react";

export default function InfoCard({
  title,
  icon = "⭐",
  children,
  className = "",
}) {
  return (
    <div className={`why-card info-card ${className}`}>
      <div className="info-card__header">
        <span className="info-icon" aria-hidden>
          {icon}
        </span>
        <h3 className="info-title">{title}</h3>
      </div>
      <p className="info-desc">{children}</p>
    </div>
  );
}

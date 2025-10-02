// src/components/why/cards/IconCard.jsx
import React from "react";

export default function IconCard({ icon, title, className = "" }) {
  return (
    <div className={`why-card icon-card ${className}`}>
      <div className="icon-card__center">
        <div className="big-icon" aria-hidden>
          {icon}
        </div>
        {title ? <div className="icon-card__title">{title}</div> : null}
      </div>
    </div>
  );
}

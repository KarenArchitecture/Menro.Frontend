import React from "react";
import LandingChartIcon from "../icons/LandingChartIcon";
export default function SalesBoostCard({
  value = 200,
  subtitle = "افزایش فروش",
  className = "",
}) {
  return (
    <div className={`why-card sales-boost ${className}`}>
      <div className="sales-boost__ring">
        {/* progress arc (masked to the same thickness as the border ring) */}
        <div className="ring-progress" aria-hidden></div>

        {/* content sits inside the ring */}
        <div className="sales-boost__content">
          {/* simple orange chart icon */}
          <LandingChartIcon />
          <div className="sales-boost__value">+{value}%</div>
          <div className="sales-boost__subtitle">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function CostReductionCard({
  label = "کاهش هزینه نرم افزاری",
  value = 300,
  className = "",
}) {
  return (
    <div className={`why-card cost-reduction ${className}`}>
      <div className="cost-reduction__icon" aria-hidden>
        📈
      </div>

      {/* placeholder chart path; later we can animate the path length or dot */}
      <svg className="chart" viewBox="0 0 300 160" aria-hidden>
        <path
          className="chart-path"
          d="M0,130 C40,140 80,120 120,140 160,160 200,80 240,120 270,150 300,20 300,20"
        />
        <circle className="chart-dot" cx="215" cy="100" r="8" />
      </svg>

      <div className="badge">{label}</div>
      <div className="kpi">+{value}%</div>
    </div>
  );
}

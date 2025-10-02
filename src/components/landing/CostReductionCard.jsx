import React from "react";
import LandingCostReductionIcon from "../icons/LandingCostReductionIcon";

export default function CostReductionCard({
  label = "کاهش هزینه نرم افزاری",
  value = 300,
  className = "",
}) {
  return (
    <div className={`why-card cost-reduction ${className}`}>
      <div className="cost-reduction__icon" aria-hidden>
        <LandingCostReductionIcon />
      </div>

      {/* static line + dot, ready for future animation */}

      <svg
        width="300"
        height="201"
        viewBox="0 0 300 201"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-5.5 178C3.32312 195.149 30.5 204.5 45 196C75.2974 178.239 74.5 145.351 95.733 145.351C114 145.351 116.094 173.323 133.401 171.325C150.708 169.327 145.618 91.9065 179.722 93.4049C213.827 94.9034 214.845 42.9569 222.99 41.9579C231.134 40.9589 227.571 75.4234 250.986 75.4234C274.401 75.4234 269.311 25.9743 286.618 25.4748C300.463 25.0752 302.567 8.99177 301.889 1"
          stroke="#F3F6FC"
          stroke-opacity="0.5"
          stroke-width="3"
        />
      </svg>

      <circle className="chart-dot">
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="13" cy="13" r="13" fill="#D17842" fill-opacity="0.4" />
          <circle cx="13" cy="13" r="10" fill="#FF683C" />
        </svg>
      </circle>

      <div className="badge">{label}</div>
      <div className="kpi">{value}%+</div>
    </div>
  );
}

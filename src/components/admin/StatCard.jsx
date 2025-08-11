import React from "react";

export default function StatCard({ iconClass, color, title, value }) {
  return (
    <div className="stat-card">
      <div className="card-icon" style={{ color }}>
        <i className={iconClass} />
      </div>
      <div className="card-info">
        <h4>{title}</h4>
        <p>{value}</p>
      </div>
    </div>
  );
}

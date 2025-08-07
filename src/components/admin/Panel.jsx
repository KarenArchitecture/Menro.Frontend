import React from "react";

export default function Panel({ title, className = "", children }) {
  return (
    <div className={`panel ${className}`}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </div>
  );
}

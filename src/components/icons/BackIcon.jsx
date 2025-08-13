import React from "react";

function BackIcon({ size = 22, color = "currentColor", ...props }) {
  return (
    <svg
      className="icon back-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor" // instead of fixed color
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

export default BackIcon; // <-- add this

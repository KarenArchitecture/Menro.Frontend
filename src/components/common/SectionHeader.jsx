import React from "react";

function SectionHeader({ icon, title, linkText = "مشاهده همه", href = "#" }) {
  return (
    <div className="res-title-box">
      <div className="res-title">
        {icon}
        <h1 className="section-title">{title}</h1>
      </div>
      <div className="res-more-box">
        <a className="res-more-link" href={href}>
          <span>{linkText}</span>
          <ChevronIcon />
        </a>
      </div>
    </div>
  );
}

const ChevronIcon = () => (
  <svg
    width="6"
    height="9"
    viewBox="0 0 6 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.07174 0.0373714C5.15805 0.00893344 5.24959 -0.00348178 5.34111 0.000837744C5.52489 0.0107347 5.69693 0.0874758 5.81958 0.214267C5.94329 0.340265 6.00789 0.506412 5.99923 0.676314C5.99057 0.846216 5.90935 1.00602 5.77336 1.12072L1.73486 4.50298L5.77336 7.88146C5.90935 7.99616 5.99057 8.15597 5.99923 8.32587C6.00789 8.49577 5.94329 8.66192 5.81958 8.78792C5.69614 8.91422 5.52352 8.99017 5.33955 8.99911C5.15558 9.00805 4.97528 8.94927 4.83816 8.83563L0.228749 4.97755C0.156718 4.91728 0.0991497 4.84375 0.0597519 4.76169C0.0203541 4.67963 0 4.59086 0 4.50109C0 4.41133 0.0203541 4.32256 0.0597519 4.2405C0.0991497 4.15843 0.156718 4.08491 0.228749 4.02464L4.83816 0.166554C4.90606 0.109711 4.98543 0.0658094 5.07174 0.0373714Z"
      fill="white"
    />
  </svg>
);

export default SectionHeader;

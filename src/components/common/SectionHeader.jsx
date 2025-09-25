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
  <svg width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.50806 1L2.44708 1.90634C1.48236 2.73046 1 3.14252 1 3.67126C1 4.20001 1.48236 4.61207 2.44708 5.43618L3.50806 6.34253" stroke="#FAFAF4" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default SectionHeader;

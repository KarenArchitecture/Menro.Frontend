import React from "react";
import ClockIcon from "../icons/ClockIcon"; // Adjust path if needed
import "../../assets/css/blog-card.css";
export default function BlogCard({ post }) {
  const { title, href, coverSrc, readingMins } = post;

  return (
    <div className="blogs__card">
      <a
        className="blogs__card-link"
        href={href || "#"}
        aria-label={`خواندن: ${title}`}
      >
        <img
          className="blogs__card-img"
          src={coverSrc}
          alt=""
          loading="lazy"
          width="360"
          height="450"
          decoding="async"
        />
        <div className="blogs__card-overlay" />
        <div className="blogs__card-meta">
          <h3 className="blogs__card-title">{title}</h3>
          <div className="blogs__card-info">
            <ClockIcon />
            <span className="blogs__mins">{readingMins} دقیقه</span>
          </div>
        </div>
      </a>
    </div>
  );
}

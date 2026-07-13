import React from "react";
import ClockIcon from "../icons/ClockIcon"; // Adjust path if needed
import "../../assets/css/blog-card.css";

// Inline icons - no separate icon files exist yet for these (unlike
// ClockIcon), so they're kept local to this component for now.
function HeartIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function BlogCard({ post }) {
  const { title, href, coverSrc, readingMins, viewCount, likeCount } = post;

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
            <span className="blogs__card-stat">
              <ClockIcon />
              <span className="blogs__mins">{readingMins} دقیقه</span>
            </span>
            {typeof likeCount === "number" && (
              <span className="blogs__card-stat">
                <HeartIcon />
                <span className="blogs__likes">{likeCount}</span>
              </span>
            )}
            {typeof viewCount === "number" && (
              <span className="blogs__card-stat">
                <EyeIcon />
                <span className="blogs__views">{viewCount}</span>
              </span>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}

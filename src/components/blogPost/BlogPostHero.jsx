import { useState } from "react";
import { Link } from "react-router-dom";

export default function BlogPostHero({ post }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, insecure context, ...) - no
      // need to interrupt the reader with an error over a "copy link" button.
    }
  };

  return (
    <div className="bp-hero">
      <nav className="bp-breadcrumb" aria-label="مسیر صفحه">
        <Link to="/blog">بلاگ</Link>
        <i className="fas fa-chevron-left" />
        {post.categoryTitle ? (
          <>
            <Link
              to={`/blogresult?${new URLSearchParams({
                category: post.categorySlug || post.categoryId,
                categoryName: post.categoryTitle,
              }).toString()}`}
            >
              {post.categoryTitle}
            </Link>
            <i className="fas fa-chevron-left" />
          </>
        ) : null}
        <span className="bp-breadcrumb__current">{post.title}</span>
      </nav>

      {post.coverImageUrl && (
        <div className="bp-cover">
          <img src={post.coverImageUrl} alt={post.title} />
          {post.categoryTitle && (
            <span className="bp-cover__category">{post.categoryTitle}</span>
          )}
        </div>
      )}

      <h1 className="bp-title">{post.title}</h1>

      <div className="bp-meta">
        <div className="bp-meta__group">
          {post.authorName && (
            <span className="bp-meta__item bp-meta__author">
              <i className="fas fa-user" />
              {post.authorName}
            </span>
          )}
          <span className="bp-meta__item">
            <i className="fas fa-calendar" />
            {post.publishedDatePersian}
          </span>
          <span className="bp-meta__item">
            <i className="fas fa-clock" />
            {post.readingMinutes} دقیقه مطالعه
          </span>
          <span className="bp-meta__item">
            <i className="fas fa-eye" />
            {post.viewCount}
          </span>
          <span className="bp-meta__item">
            <i className="fas fa-heart" />
            {post.likeCount}
          </span>
        </div>

        <button type="button" className="bp-share-btn" onClick={handleShare}>
          <i className={`fas ${copied ? "fa-check" : "fa-link"}`} />
          {copied ? "کپی شد" : "اشتراک‌گذاری"}
        </button>
      </div>
    </div>
  );
}

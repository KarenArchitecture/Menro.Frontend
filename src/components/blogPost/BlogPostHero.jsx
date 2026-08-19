import { useState } from "react";
import { Link } from "react-router-dom";
import { toggleBlogPostLike } from "../../api/blogs";
import useRequireLogin from "../../hooks/useRequireLogin";
import ProtectedActionModal from "../common/ProtectedActionModal";

export default function BlogPostHero({ post }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [liking, setLiking] = useState(false);

  const { requireLogin, open, closeModal, goToLogin, modalProps } =
    useRequireLogin();

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

  const doToggleLike = async () => {
    if (liking) return;

    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setLiking(true);

    try {
      const result = await toggleBlogPostLike(post.slug);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLiking(false);
    }
  };

  const handleLikeClick = () => {
    requireLogin({
      onAuthenticated: doToggleLike,
      type: "blogLike",
    });
  };

  const handleGoToLogin = () => {
    closeModal();
    goToLogin();
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
            {likeCount}
          </span>
        </div>

        <div className="bp-actions">
          <button
            type="button"
            className={`bp-like-btn ${liked ? "bp-like-btn--liked" : ""}`}
            onClick={handleLikeClick}
            disabled={liking}
            aria-pressed={liked}
            title={liked ? "برداشتن لایک" : "لایک کردن"}
          >
            <i className={`${liked ? "fas" : "far"} fa-heart`} />
          </button>

          <button type="button" className="bp-share-btn" onClick={handleShare}>
            <i className={`fas ${copied ? "fa-check" : "fa-link"}`} />
            {copied ? "کپی شد" : "اشتراک‌گذاری"}
          </button>
        </div>
      </div>

      <ProtectedActionModal
        open={open}
        onClose={closeModal}
        onLogin={handleGoToLogin}
        icon={modalProps.icon}
        title={modalProps.title}
        description={modalProps.description}
      />
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import AdBanner from "../common/AdBanner";

const BlogSidebar = ({ tags = [], loading = false }) => {
  const navigate = useNavigate();

  // Same caveat as BlogCategories: falls back to tag.id if the tags list
  // doesn't carry a slug yet, but PublicBlogPostsController expects
  // tagSlug - confirm the backend tag shape includes it.
  const handleTagClick = (tag) => {
    const slug = tag.slug || tag.id;
    const params = new URLSearchParams({ tag: slug, tagName: tag.name });
    navigate(`/blogresult?${params.toString()}`);
  };

  return (
    <aside className="blog-sidebar-container" dir="rtl">
      <div className="blog-sidebar-tags-box">
        <h3 className="sidebar-tags-title">
          برچسب های <span style={{ color: "#FF683C" }}>پیشنهادی</span>
        </h3>

        {!loading && (
          <ul className="sidebar-tags-list">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="sidebar-tag-item"
                role="button"
                tabIndex={0}
                onClick={() => handleTagClick(tag)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleTagClick(tag);
                  }
                }}
              >
                <div className="sidebar-tag-item-right">
                  <img
                    src="/images/blog-pics/tag.svg"
                    alt="hashtag"
                    className="sidebar-tag-hashtag-icon"
                  />
                  <span className="sidebar-tag-item-name">{tag.name}</span>
                </div>
                <span className="sidebar-tag-item-count">
                  {typeof tag.articleCount === "number"
                    ? `${tag.articleCount} مقاله`
                    : tag.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="blog-sidebar-ad-box">
        <AdBanner slotKey="blog-sidebar-ad" height={300} maxWidth={400} />
      </div>
    </aside>
  );
};

export default BlogSidebar;

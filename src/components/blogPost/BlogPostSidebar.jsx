import { useState } from "react";
import { Link } from "react-router-dom";
import AdBanner from "../../components/common/AdBanner";

export default function BlogPostSidebar({ tags = [], popularPosts = [] }) {
  const [brokenThumbs, setBrokenThumbs] = useState(() => new Set());

  return (
    <aside className="bp-sidebar">
      <div className="bp-sidebar__sticky">
        <div className="blog-sidebar-ad-box bp-sidebar__ad">
          <AdBanner slotKey="blog-post-sidebar" height="100%" maxWidth="100%" />
        </div>

        {tags.length > 0 && (
          <div className="blog-sidebar-tags-box bp-sidebar__box">
            <h3 className="sidebar-tags-title">برچسب‌های پیشنهادی</h3>
            <ul className="sidebar-tags-list">
              {tags.map((tag) => (
                <li key={tag.id} className="sidebar-tag-item">
                  <Link
                    to={`/blogresult?${new URLSearchParams({
                      tag: tag.slug || tag.id,
                      tagName: tag.name,
                    }).toString()}`}
                    className="sidebar-tag-item-right"
                  >
                    <i className="fas fa-hashtag sidebar-tag-hashtag-icon" />
                    <span className="sidebar-tag-item-name">{tag.name}</span>
                  </Link>
                  {tag.articleCount != null && (
                    <span className="sidebar-tag-item-count">
                      {tag.articleCount} مقاله
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {popularPosts.length > 0 && (
          <div className="blog-sidebar-tags-box bp-sidebar__box">
            <h3 className="sidebar-tags-title">پست‌های محبوب</h3>
            <ul className="bp-sidebar__popular-list">
              {popularPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="bp-sidebar__popular-item"
                  >
                    <div className="bp-sidebar__popular-thumb">
                      {post.coverImageUrl && !brokenThumbs.has(post.id) ? (
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          onError={() =>
                            setBrokenThumbs((prev) =>
                              new Set(prev).add(post.id),
                            )
                          }
                        />
                      ) : (
                        <i className="fas fa-image" />
                      )}
                    </div>
                    <span className="bp-sidebar__popular-title">
                      {post.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

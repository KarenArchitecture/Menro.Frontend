import React from "react";
import AdBanner from "../common/AdBanner";

const BlogSidebar = ({ tags = [], loading = false }) => {
  return (
    <aside className="blog-sidebar-container" dir="rtl">
      <div className="blog-sidebar-tags-box">
        <h3 className="sidebar-tags-title">
          برچسب های <span style={{ color: "#FF683C" }}>پیشنهادی</span>
        </h3>

        {!loading && (
          <ul className="sidebar-tags-list">
            {tags.map((tag) => (
              <li key={tag.id} className="sidebar-tag-item">
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

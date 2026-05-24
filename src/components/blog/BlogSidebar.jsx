import React from "react";
// Make sure to adjust this import path to point correctly to your AdBanner component
import AdBanner from "../home/AdBanner";

const BlogSidebar = () => {
  // Creating an array of 8 tags: alternating 4 "منرو" and 4 "آموزش آشپزی"
  const suggestedTags = Array.from({ length: 8 }, (_, index) => ({
    name: index % 2 === 0 ? "منرو" : "آموزش آشپزی",
    count: "۹۶ مقاله",
  }));

  return (
    <aside className="blog-sidebar-container" dir="rtl">
      {/* Tags Section */}
      <div className="blog-sidebar-tags-box">
        <h3 className="sidebar-tags-title">
          برچسب های <span style={{ color: "#FF683C" }}>پیشنهادی</span>
        </h3>

        <ul className="sidebar-tags-list">
          {suggestedTags.map((tag, index) => (
            <li key={index} className="sidebar-tag-item">
              <div className="tag-item-right">
                <img
                  src="/images/blog-pics/tag.svg"
                  alt="hashtag"
                  className="tag-hashtag-icon"
                />
                <span className="tag-item-name">{tag.name}</span>
              </div>
              <span className="tag-item-count">{tag.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ad Banner Section */}
      <div className="blog-sidebar-ad-box">
        {/* Using your existing AdBanner component */}
        <AdBanner slotKey="blog-sidebar-ad" height={300} maxWidth={400} />
      </div>
    </aside>
  );
};

export default BlogSidebar;

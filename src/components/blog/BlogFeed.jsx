import React from "react";
import BlogCard from "../common/BlogCard"; // Adjust path based on where you saved it
import { blogs, categories } from "./blogData"; // Import both blogs and categories

const BlogFeed = () => {
  return (
    <div className="blog-feed-container">
      {/* Category Nav */}
      <nav className="blog-feed-nav">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className={`feed-nav-btn ${idx === 0 ? "active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Scrollable Feed Area */}
      <div className="blog-feed-scroll-area">
        <div className="blog-feed-grid">
          {blogs.map((post) => (
            // Ensure your BlogCard accepts a 'post' prop, or spread it like {...post}
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      <button className="blog-feed-show-more">نمایش بیشتر...</button>
    </div>
  );
};

export default BlogFeed;

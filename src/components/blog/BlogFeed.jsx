// src/components/blog/BlogFeed.jsx

import React, { useState, useRef, useEffect } from "react";
import BlogCard from "../common/BlogCard";
import { blogs, categories } from "./blogData";

const BlogFeed = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  // 1. Ref for the scrollable container
  const scrollAreaRef = useRef(null);

  // 2. Refs for drag-to-scroll functionality
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const dragStartCoords = useRef({ x: 0, y: 0 });

  // 3. Reset scroll position to top whenever activeCategory changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [activeCategory]);

  // --- Drag to Scroll Handlers ---
  const handleMouseDown = (e) => {
    isDragging.current = true;

    // Record where the mouse started for click prevention
    dragStartCoords.current = { x: e.clientX, y: e.clientY };

    // Record starting scroll position
    startY.current = e.pageY - scrollAreaRef.current.offsetTop;
    scrollTop.current = scrollAreaRef.current.scrollTop;

    // Change cursor and prevent text selection
    scrollAreaRef.current.style.cursor = "grabbing";
    scrollAreaRef.current.style.userSelect = "none";
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (scrollAreaRef.current) {
      scrollAreaRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollAreaRef.current) {
      scrollAreaRef.current.style.cursor = "grab";
      scrollAreaRef.current.style.userSelect = "auto"; // Re-enable text selection
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    e.preventDefault(); // Prevents default browser dragging behaviors

    const y = e.pageY - scrollAreaRef.current.offsetTop;
    const walk = (y - startY.current) * 1.5; // Scroll speed multiplier

    scrollAreaRef.current.scrollTop = scrollTop.current - walk;
  };

  // Intercept the click event before it reaches the blog cards
  const handleClickCapture = (e) => {
    // Calculate how far the mouse moved between mousedown and click
    const dx = Math.abs(e.clientX - dragStartCoords.current.x);
    const dy = Math.abs(e.clientY - dragStartCoords.current.y);

    // If the mouse moved more than 5 pixels, treat it as a drag and stop the click
    if (dx > 5 || dy > 5) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const filteredBlogs =
    activeCategory === "همه"
      ? blogs
      : blogs.filter((post) => post.category === activeCategory);

  return (
    <div className="blog-feed-container">
      {/* Category Nav */}
      <nav className="blog-feed-nav">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className={`feed-nav-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Scrollable Feed Area */}
      <div
        className="blog-feed-scroll-area"
        ref={scrollAreaRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClickCapture={handleClickCapture}
        style={{ cursor: "grab" }}
      >
        <div className="blog-feed-grid">
          {filteredBlogs.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      <button className="blog-feed-show-more">نمایش بیشتر...</button>
    </div>
  );
};

export default BlogFeed;

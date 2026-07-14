// src/components/blog/BlogFeed.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import BlogCard from "../common/BlogCard";
import { getBlogPosts } from "../../api/blogs";

const FEED_TABS = [
  { label: "جدیدترین‌ها", sort: "Newest" },
  { label: "محبوب‌ترین‌ها", sort: "MostPopular" },
  { label: "پربازدیدترین‌ها", sort: "MostViewed" },
];

const PAGE_SIZE = 10;

function mapPostForCard(p) {
  return {
    id: p.id,
    title: p.title,
    href: `/blog/${p.id}`,
    coverSrc: p.coverImageUrl || "",
    readingMins: p.readingMinutes,
    viewCount: p.viewCount,
    likeCount: p.likeCount,
    publishedDate: p.publishedDatePersian,
  };
}

const BlogFeed = () => {
  const [activeTab, setActiveTab] = useState(FEED_TABS[0]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const scrollAreaRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const dragStartCoords = useRef({ x: 0, y: 0 });
  const requestIdRef = useRef(0);

  const loadPage = useCallback(async (tab, pageNum) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    try {
      const data = await getBlogPosts({
        sort: tab.sort,
        page: pageNum,
        pageSize: PAGE_SIZE,
      });
      // Ignore this response if a newer request (e.g. from switching tabs
      // again before this one resolved) has since been fired.
      if (requestId !== requestIdRef.current) return;
      setPosts(data.items.map(mapPostForCard));
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setPage(data.page);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError("بارگذاری مقاله‌ها با خطا مواجه شد.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  // Whenever the sort tab changes, jump back to page 1 and fetch it in one
  // shot - avoids firing a fetch for the old tab's stale page number before
  // the reset-to-1 effect runs.
  useEffect(() => {
    setPage(1);
    loadPage(activeTab, 1);
    if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Manual pagination (prev/next) within the current tab.
  useEffect(() => {
    if (page === 1) return; // already fetched by the tab-change effect above
    loadPage(activeTab, page);
    if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartCoords.current = { x: e.clientX, y: e.clientY };
    startY.current = e.pageY - scrollAreaRef.current.offsetTop;
    scrollTop.current = scrollAreaRef.current.scrollTop;
    scrollAreaRef.current.style.cursor = "grabbing";
    scrollAreaRef.current.style.userSelect = "none";
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (scrollAreaRef.current) scrollAreaRef.current.style.cursor = "grab";
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollAreaRef.current) {
      scrollAreaRef.current.style.cursor = "grab";
      scrollAreaRef.current.style.userSelect = "auto";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const y = e.pageY - scrollAreaRef.current.offsetTop;
    const walk = (y - startY.current) * 1.5;
    scrollAreaRef.current.scrollTop = scrollTop.current - walk;
  };

  const handleClickCapture = (e) => {
    const dx = Math.abs(e.clientX - dragStartCoords.current.x);
    const dy = Math.abs(e.clientY - dragStartCoords.current.y);
    if (dx > 5 || dy > 5) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className="blog-feed-container">
      <nav className="blog-feed-nav">
        {FEED_TABS.map((tab) => (
          <button
            key={tab.sort}
            className={`feed-nav-btn ${activeTab.sort === tab.sort ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

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
        {loading && <div className="empty-hint">در حال بارگذاری...</div>}
        {!loading && error && <div className="form-error">{error}</div>}
        {!loading && !error && posts.length === 0 && (
          <div className="empty-hint">مقاله‌ای پیدا نشد.</div>
        )}
        {!loading && !error && posts.length > 0 && (
          <div className="blog-feed-grid">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="blog-feed-pagination">
          <button
            type="button"
            className="blog-feed-pagination__btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            قبلی
          </button>
          <span className="blog-feed-pagination__label">
            صفحه {page} از {totalPages} ({totalCount} مقاله)
          </span>
          <button
            type="button"
            className="blog-feed-pagination__btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogFeed;

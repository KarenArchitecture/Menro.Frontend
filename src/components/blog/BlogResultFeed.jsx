// src/components/blog/BlogResultFeed.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import BlogCard from "../common/BlogCard";
import { getBlogResultPosts } from "../../api/blogs";

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

// filters: { search?, categorySlug?, tagSlug? } — decided by BlogResultPage
// from the URL. This component owns its own fetch/sort/pagination state,
// the same way BlogFeed does on the main blog page.
const BlogResultFeed = ({ filters, onTotalCountChange }) => {
  const [activeTab, setActiveTab] = useState(FEED_TABS[0]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const onTotalCountChangeRef = useRef(onTotalCountChange);
  onTotalCountChangeRef.current = onTotalCountChange;

  const loadPage = useCallback(async (currentFilters, tab, pageNum) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    try {
      const data = await getBlogResultPosts({
        ...currentFilters,
        sort: tab.sort,
        page: pageNum,
        pageSize: PAGE_SIZE,
      });
      if (requestId !== requestIdRef.current) return;
      setPosts(data.items.map(mapPostForCard));
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setPage(data.page);
      onTotalCountChangeRef.current?.(data.totalCount);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError("بارگذاری مقاله‌ها با خطا مواجه شد.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  // Filters changing (new search term, different tag/category coming from
  // the URL) or the sort tab changing both reset pagination back to 1.
  useEffect(() => {
    setPage(1);
    loadPage(filters, activeTab, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab]);

  // Manual pagination (prev/next) within the current filters/tab.
  useEffect(() => {
    if (page === 1) return; // already fetched by the effect above
    loadPage(filters, activeTab, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleTabChange = (tab) => setActiveTab(tab);

  return (
    <div className="blog-feed-container">
      <nav className="blog-feed-nav">
        {FEED_TABS.map((tab) => (
          <button
            key={tab.sort}
            className={`feed-nav-btn ${activeTab.sort === tab.sort ? "active" : ""}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="blog-feed-scroll-area">
        {loading && <div className="empty-hint">در حال بارگذاری...</div>}
        {!loading && error && <div className="form-error">{error}</div>}
        {!loading && !error && posts.length === 0 && (
          <div className="result-empty-state">
            <p>مقاله‌ای با این مشخصات پیدا نشد.</p>
            <span>کلمه دیگری را جستجو کنید یا فیلتر را پاک کنید.</span>
          </div>
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

export default BlogResultFeed;

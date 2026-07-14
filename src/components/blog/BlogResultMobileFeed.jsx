// src/components/blog/BlogResultMobileFeed.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import BlogCard from "../common/BlogCard";
import { getBlogResultPosts } from "../../api/blogs";

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

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

// filters: { search?, categorySlug?, tagSlug? } — same filters object
// BlogResultFeed receives; this component just fetches independently for
// the mobile layout, mirroring BlogMobileFeedModule on the main blog page.
export default function BlogResultMobileFeed({
  filters,
  onTotalCountChange,
  rows = 3,
  perRow = 2,
}) {
  const pageSize = rows * perRow;

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const onTotalCountChangeRef = useRef(onTotalCountChange);
  onTotalCountChangeRef.current = onTotalCountChange;

  const loadPage = useCallback(
    async (currentFilters, pageNum) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError("");
      try {
        const data = await getBlogResultPosts({
          ...currentFilters,
          sort: "Newest",
          page: pageNum,
          pageSize,
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
    },
    [pageSize],
  );

  useEffect(() => {
    loadPage(filters, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pageSize]);

  const groupedPosts = chunkArray(posts, perRow);

  return (
    <section className="mobile-blog-feed">
      {loading && <div className="empty-hint">در حال بارگذاری...</div>}
      {!loading && error && <div className="form-error">{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="result-empty-state">
          <p>مقاله‌ای با این مشخصات پیدا نشد.</p>
          <span>کلمه دیگری را جستجو کنید یا فیلتر را پاک کنید.</span>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="mobile-blog-feed__grid">
          {groupedPosts.map((row, rowIndex) => (
            <div key={rowIndex} className="mobile-blog-feed__row">
              {row.map((post) => (
                <div key={post.id} className="mobile-blog-feed__card">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="blog-feed-pagination mobile-blog-feed__pagination">
          <button
            type="button"
            className="blog-feed-pagination__btn"
            disabled={page <= 1}
            onClick={() => loadPage(filters, page - 1)}
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
            onClick={() => loadPage(filters, page + 1)}
          >
            بعدی
          </button>
        </div>
      )}
    </section>
  );
}

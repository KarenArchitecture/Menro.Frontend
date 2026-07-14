import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "../components/common/AppHeader";
import MobileHeader from "../components/common/MobileHeader";
import BlogResultHero from "../components/blog/BlogResultHero";
import BlogResultFeed from "../components/blog/BlogResultFeed";
import BlogResultMobileFeed from "../components/blog/BlogResultMobileFeed";
import BlogSidebar from "../components/blog/BlogSidebar";
import GlassFooter from "../components/common/GlassFooter";
import FooterFruitsScene from "../components/common/FooterFruitsScene";
import { getBlogPageBootstrap } from "../api/blogs";

import "../assets/css/styles-blog.css";
import "../assets/css/blog-result.css";

const leftIcons = [
  /* unchanged */
];

// Reachable three ways, all landing on this same layout:
//   1. free search        -> /blogresult?search=برگر
//   2. clicking a tag      -> /blogresult?tag=fast-food&tagName=فست‌فود
//   3. clicking a category -> /blogresult?category=fast-food&categoryName=فست‌فود
//
// tagName/categoryName ride along as query params from whichever page the
// user clicked the chip on (it already has the display name in hand), so
// the hero doesn't need an extra round trip just to resolve a slug to a
// title. tag/category take priority over search if somehow both are present.
const BlogResultPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("search") || "";
  const tagSlug = searchParams.get("tag") || "";
  const tagName = searchParams.get("tagName") || tagSlug;
  const categorySlug = searchParams.get("category") || "";
  const categoryName = searchParams.get("categoryName") || categorySlug;

  const resultType = tagSlug ? "tag" : categorySlug ? "category" : "search";

  // Stable object reference per distinct filter combo, so it's safe to use
  // as a useEffect dependency in the feed components.
  const filters = useMemo(() => {
    if (resultType === "tag") return { tagSlug };
    if (resultType === "category") return { categorySlug };
    return { search: searchQuery };
  }, [resultType, tagSlug, categorySlug, searchQuery]);

  // Reported by whichever feed (desktop/mobile) finishes fetching - both
  // are mounted at once (toggled via CSS like the main blog page already
  // does), and both query the same filters, so either one's totalCount is
  // valid for the hero.
  const [resultCount, setResultCount] = useState(null);

  // Sidebar's suggested tags aren't tied to the active filter - same
  // bootstrap endpoint the main blog page already uses.
  const [sidebarTags, setSidebarTags] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getBlogPageBootstrap();
        if (!cancelled) setSidebarTags(data?.sidebarTags ?? []);
      } catch (err) {
        console.error("Failed to load sidebar bootstrap", err);
      } finally {
        if (!cancelled) setSidebarLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset the count whenever the filter itself changes, so the hero doesn't
  // flash the previous filter's number while the new one is loading.
  useEffect(() => {
    setResultCount(null);
  }, [filters]);

  const handleSearch = useCallback(
    (term) => {
      setSearchParams(term ? { search: term } : {});
    },
    [setSearchParams],
  );

  const handleClearFilter = useCallback(() => {
    navigate("/blog");
  }, [navigate]);

  return (
    <div className="result-page-wrapper blog-page-wrapper" dir="rtl">
      <div className="header-wrapper">
        <AppHeader
          leftIcons={leftIcons}
          position="fixed"
          top={12}
          maxWidth={1140}
          className="landing-desktop-header"
        />
      </div>

      <MobileHeader />

      <BlogResultHero
        resultType={resultType}
        query={searchQuery}
        tagName={tagName}
        categoryName={categoryName}
        resultCount={resultCount}
        onSearch={handleSearch}
        onClearFilter={handleClearFilter}
      />

      <div className="blog-desktop-layout">
        <section className="blog-content-section">
          <div className="blog-content-wrapper">
            <BlogResultFeed
              filters={filters}
              onTotalCountChange={setResultCount}
            />
            <BlogSidebar tags={sidebarTags} loading={sidebarLoading} />
          </div>
        </section>
      </div>

      <div className="blog-mobile-layout">
        <section className="blog-mobile-feed-section">
          <BlogResultMobileFeed
            filters={filters}
            onTotalCountChange={setResultCount}
            rows={3}
            perRow={2}
          />
        </section>
      </div>

      <section className="footer-bg blog-footer">
        <FooterFruitsScene />
        <div className="footer-bg__content">
          <GlassFooter />
        </div>
      </section>
    </div>
  );
};

export default BlogResultPage;

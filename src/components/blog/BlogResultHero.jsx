import React, { useEffect, useState } from "react";
import SearchBar from "../common/SearchBar";

// resultType: "search" | "tag" | "category"
// The page that renders this always knows how it got here (query string,
// route param, or a click coming from elsewhere in the site), so it just
// passes that context down as props - no fetching happens in here.
function getHeroCopy({ resultType, query, tagName, categoryName }) {
  switch (resultType) {
    case "tag":
      return {
        eyebrow: "برچسب",
        title: (
          <>
            مقاله‌های برچسب <span className="highlight-text">#{tagName}</span>
          </>
        ),
      };
    case "category":
      return {
        eyebrow: "دسته‌بندی",
        title: (
          <>
            مقاله‌های دسته‌بندی{" "}
            <span className="highlight-text">{categoryName}</span>
          </>
        ),
      };
    case "search":
    default:
      return {
        eyebrow: "نتایج جستجو",
        title: query ? (
          <>
            نتایج جستجو برای <span className="highlight-text">«{query}»</span>
          </>
        ) : (
          <>نتایج جستجو</>
        ),
      };
  }
}

const BlogResultHero = ({
  resultType = "search",
  query = "",
  tagName = "",
  categoryName = "",
  resultCount = null, // null while the feed below hasn't reported a count yet
  onSearch,
  onClearFilter,
}) => {
  const { eyebrow, title } = getHeroCopy({
    resultType,
    query,
    tagName,
    categoryName,
  });

  // Controlled input, seeded from the URL's search term when that's how we
  // got here. Needs its own state + onChange - just passing `value` down
  // without a way to update it froze the field on every keystroke.
  const [searchValue, setSearchValue] = useState(
    resultType === "search" ? query : "",
  );

  useEffect(() => {
    setSearchValue(resultType === "search" ? query : "");
  }, [resultType, query]);

  return (
    <section className="result-hero-section">
      <div className="result-hero-content">
        <span className="result-hero-eyebrow">{eyebrow}</span>
        <h1 className="result-hero-title">{title}</h1>

        {resultCount !== null && (
          <p className="result-hero-count">
            {resultCount > 0
              ? `${resultCount} مقاله پیدا شد`
              : "مقاله‌ای پیدا نشد"}
          </p>
        )}

        <div className="result-hero-search-wrap">
          <SearchBar
            placeholder="جستجو در مقاله‌ها ..."
            value={searchValue}
            onChange={setSearchValue}
            onSubmit={onSearch}
          />
        </div>

        <button
          type="button"
          className="result-clear-filter-btn"
          onClick={onClearFilter}
        >
          مشاهده همه مقاله‌ها
        </button>
      </div>
    </section>
  );
};

export default BlogResultHero;

import React, { useMemo } from "react";
import BlogCard from "../common/BlogCard";
import AdBanner from "../home/AdBanner";
import { blogs } from "./blogData";

const suggestedTags = Array.from({ length: 8 }, (_, index) => ({
  name: index % 2 === 0 ? "منرو" : "آموزش آشپزی",
  count: "۹۶ مقاله",
}));

/* ---------------- TAGS ---------------- */
function MobileBlogTags() {
  return (
    <div className="mobile-blog-tags">
      <h3 className="mobile-blog-tags__title">
        برچسب های <span>پیشنهادی</span>
      </h3>

      <ul className="mobile-blog-tags__list">
        {suggestedTags.slice(0, 6).map((tag, index) => (
          <li key={index} className="mobile-blog-tags__item">
            <div className="mobile-blog-tags__right">
              <span className="mobile-blog-tags__hash">#</span>
              <span className="mobile-blog-tags__name">{tag.name}</span>
            </div>
            <span className="mobile-blog-tags__count">{tag.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- BANNER ---------------- */
function MobileTagsBanner() {
  return (
    <div className="mobile-tags-banner">
      <div className="mobile-tags-banner__body">
        <AdBanner
          slotKey="blog-mobile-tags-banner"
          height={180}
          maxWidth={400}
        />
      </div>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */
function getRandomBlogs(count = 2) {
  const shuffled = [...blogs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getRandomPairType() {
  const types = ["blogTags", "blogBanner", "blogTagsBanner", "bannerTags"];
  return types[Math.floor(Math.random() * types.length)];
}

/* ---------------- BLOG ROW ---------------- */
function BlogCardsRow({ posts }) {
  if (!posts) return null;

  return (
    <div className="mobile-blog-feed__row">
      {posts.map((post) => (
        <div key={post.id} className="mobile-blog-feed__card">
          <BlogCard post={post} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- PAIR RENDER ---------------- */
function PairContent({ pairType, posts }) {
  if (pairType === "bannerTags") {
    return (
      <>
        <MobileTagsBanner />
        <MobileBlogTags />
      </>
    );
  }

  return (
    <>
      <BlogCardsRow posts={posts} />

      {pairType === "blogTags" && <MobileBlogTags />}

      {pairType === "blogBanner" && <MobileTagsBanner />}

      {pairType === "blogTagsBanner" && <MobileTagsBanner />}
    </>
  );
}

/* ---------------- MAIN MODULE ---------------- */
export default function BlogMobileBlocksModule({
  mode = "random",
  forcedPairType = "blogTags",
  forcedPosts = null,

  showButton = false, // ✅ NEW
  onButtonClick = null, // optional
}) {
  const pairType = useMemo(() => {
    return mode === "manual" ? forcedPairType : getRandomPairType();
  }, [mode, forcedPairType]);

  const posts = useMemo(() => {
    if (pairType === "bannerTags") return null;
    return forcedPosts || getRandomBlogs(2);
  }, [forcedPosts, pairType]);

  return (
    <section className="mobile-blog-blocks">
      <PairContent pairType={pairType} posts={posts} />

      {showButton && (
        <button
          className="mobile-blog-blocks__cta"
          onClick={onButtonClick}
          type="button"
        >
          نمایش بیشتر...
        </button>
      )}
    </section>
  );
}

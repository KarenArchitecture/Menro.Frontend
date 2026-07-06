import React, { useMemo } from "react";
import BlogCard from "../common/BlogCard";
import { blogs } from "./blogData";

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Shows 3 rows, 2 cards per row
 */
export default function BlogMobileFeedModule({
  posts = blogs,
  rows = 3,
  perRow = 2,
}) {
  const visiblePosts = useMemo(() => {
    return posts.slice(0, rows * perRow);
  }, [posts, rows, perRow]);

  const groupedPosts = useMemo(() => {
    return chunkArray(visiblePosts, perRow);
  }, [visiblePosts, perRow]);

  return (
    <section className="mobile-blog-feed">
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
    </section>
  );
}

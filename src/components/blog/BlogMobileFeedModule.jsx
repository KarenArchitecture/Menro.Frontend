import React, { useEffect, useState } from "react";
import BlogCard from "../common/BlogCard";
import { getBlogPosts } from "../../api/blogs";

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
  };
}

export default function BlogMobileFeedModule({ rows = 3, perRow = 2 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getBlogPosts({ sort: "Newest" });
        if (!cancelled)
          setPosts(data.slice(0, rows * perRow).map(mapPostForCard));
      } catch (err) {
        console.error("Failed to load mobile blog feed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rows, perRow]);

  if (loading) return null;

  const groupedPosts = chunkArray(posts, perRow);

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

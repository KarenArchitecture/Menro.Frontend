import { useState } from "react";
import { Link } from "react-router-dom";

export default function RelatedPosts({ posts }) {
  const [brokenThumbs, setBrokenThumbs] = useState(() => new Set());

  if (!posts || posts.length === 0) return null;

  return (
    <section className="bp-related">
      <h2 className="bp-related__title">مطالب مرتبط</h2>
      <div className="bp-related__grid">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="bp-related__card"
          >
            <div className="bp-related__thumb">
              {post.coverImageUrl && !brokenThumbs.has(post.id) ? (
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  onError={() =>
                    setBrokenThumbs((prev) => new Set(prev).add(post.id))
                  }
                />
              ) : (
                <i className="fas fa-image" />
              )}
            </div>
            <span className="bp-related__card-title">{post.title}</span>
            <span className="bp-related__card-meta">
              <i className="fas fa-clock" /> {post.readingMinutes} دقیقه
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

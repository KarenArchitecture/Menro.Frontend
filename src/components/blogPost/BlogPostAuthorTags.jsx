import { Link } from "react-router-dom";

export default function BlogPostAuthorTags({ post }) {
  return (
    <div className="bp-after-body">
      {post.authorName && (
        <div className="bp-author-box">
          <div className="bp-author-box__avatar">
            <i className="fas fa-user" />
          </div>
          <div>
            <span className="bp-author-box__eyebrow">نویسنده</span>
            <span className="bp-author-box__name">{post.authorName}</span>
          </div>
        </div>
      )}

      {post.tags?.length > 0 && (
        <div className="bp-tags">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/blogresult?${new URLSearchParams({
                tag: tag.slug || tag.id,
                tagName: tag.name,
              }).toString()}`}
              className="bp-tags__chip"
            >
              <i className="fas fa-hashtag" />
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

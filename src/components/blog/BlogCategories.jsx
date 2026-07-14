import React from "react";
import { useNavigate } from "react-router-dom";

const BlogCategories = ({ categories = [], loading = false }) => {
  const navigate = useNavigate();

  if (loading || categories.length === 0) return null;

  // NOTE: falls back to category.id when there's no slug on the payload
  // yet. PublicBlogPostsController filters by categorySlug, so this only
  // resolves real results once the bootstrap DTO exposes a proper slug -
  // worth confirming with the backend category list shape.
  const handleCategoryClick = (category) => {
    const slug = category.slug || category.id;
    const params = new URLSearchParams({
      category: slug,
      categoryName: category.title,
    });
    navigate(`/blogresult?${params.toString()}`);
  };

  return (
    <section className="blog-categories-section">
      <div className="categories-wrapper">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            role="button"
            tabIndex={0}
            onClick={() => handleCategoryClick(category)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCategoryClick(category);
              }
            }}
          >
            <div
              className="category-icon-box"
              style={{ backgroundColor: category.colorHex }}
            ></div>
            <div className="category-text">
              <h3>{category.title}</h3>
              <p>{category.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogCategories;

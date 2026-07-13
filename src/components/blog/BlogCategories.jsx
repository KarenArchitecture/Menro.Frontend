import React from "react";

const BlogCategories = ({ categories = [], loading = false }) => {
  if (loading || categories.length === 0) return null;

  return (
    <section className="blog-categories-section">
      <div className="categories-wrapper">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
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

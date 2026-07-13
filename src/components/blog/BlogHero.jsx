import React from "react";
import SearchBar from "../common/SearchBar";

const BlogHero = ({ hero }) => {
  return (
    <section className="blog-hero-section">
      <img
        src="/images/blog-pics/blog-fries.svg"
        alt="Fries"
        className="floating-img img-fries"
      />
      <img
        src="/images/blog-pics/blog-burger.svg"
        alt="Burger"
        className="floating-img img-burger"
      />
      <img
        src="/images/blog-pics/blog-ramen.svg"
        alt="Ramen"
        className="floating-img img-ramen"
      />
      <img
        src="/images/blog-pics/blog-sushi.svg"
        alt="Sushi"
        className="floating-img img-sushi"
      />
      <img
        src="/images/blog-pics/blog-pizza.svg"
        alt="Pizza"
        className="floating-img img-pizza"
      />
      <img
        src="/images/blog-pics/blog-soda.svg"
        alt="Soda"
        className="floating-img img-soda"
      />

      <div className="blog-hero-content">
        <h1 className="hero-title">
          {hero?.titleLine}{" "}
          <span className="highlight-text">{hero?.highlight}</span>
        </h1>
        <SearchBar placeholder={hero?.searchPlaceholder || "جستجو مقاله ..."} />
      </div>

      <div className="scroll-indicator">
        <span>اسکرول کنید</span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </section>
  );
};

export default BlogHero;

// src/components/blog/BlogHero.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import ParticleField from "./ParticleField";
import useHeroPointer from "./useHeroPointer";
import useKineticFloaters from "./useKineticFloaters";

// Dark gradient from the CodePen (bottom -> top)
const HERO_BG = "linear-gradient(0deg, #191d1e 50%, #283139 100%)";

// The floating food images. Each keeps its own CSS class for position/size
// (img-fries, img-burger, ...), and they all share the `floating-img` class,
// which is what the physics hook looks for.
const FLOATERS = [
  { src: "/images/blog-pics/blog-fries.svg", alt: "Fries", cls: "img-fries" },
  { src: "/images/blog-pics/blog-burger.svg", alt: "Burger", cls: "img-burger" },
  { src: "/images/blog-pics/blog-ramen.svg", alt: "Ramen", cls: "img-ramen" },
  { src: "/images/blog-pics/blog-sushi.svg", alt: "Sushi", cls: "img-sushi" },
  { src: "/images/blog-pics/blog-pizza.svg", alt: "Pizza", cls: "img-pizza" },
  { src: "/images/blog-pics/blog-soda.svg", alt: "Soda", cls: "img-soda" },
];

const BlogHero = ({ hero }) => {
  const navigate = useNavigate();

  const sectionRef = useRef(null);
  const pointerRef = useHeroPointer(sectionRef);
  useKineticFloaters(sectionRef, pointerRef);

  const handleSearch = (term) => {
    if (!term) return;
    navigate(`/blogresult?search=${encodeURIComponent(term)}`);
  };

  return (
    <section
      ref={sectionRef}
      className="blog-hero-section"
      style={{
        // the particle canvas fills this section and sits behind everything
        position: "relative",
        isolation: "isolate",
        background: HERO_BG,
      }}
    >
      <ParticleField pointerRef={pointerRef} />

      {FLOATERS.map((f) => (
        <img
          key={f.cls}
          src={f.src}
          alt={f.alt}
          className={`floating-img ${f.cls}`}
          draggable={false}
        />
      ))}

      <div className="blog-hero-content">
        <h1 className="hero-title">
          {hero?.titleLine}{" "}
          <span className="highlight-text">{hero?.highlight}</span>
        </h1>
        <SearchBar
          placeholder={hero?.searchPlaceholder || "جستجو مقاله ..."}
          onSubmit={handleSearch}
        />
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
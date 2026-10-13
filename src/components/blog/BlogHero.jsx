// src/components/blog/BlogHero.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import MouseIcon from "../icons/MouseIcon";
import ParticleField from "./ParticleField";
import useHeroPointer from "./useHeroPointer";
import useKineticFloaters from "./useKineticFloaters";

const HERO_BG = "linear-gradient(0deg, #191d1e 50%, #283139 100%)";

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
      className="blog-hero-section bhl-section"
      style={{
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

      <div className="bhl__overlay">
        <div className="bhl__content">
          <h1 className="bhl__title">
            <span>{hero?.highlight}</span> {hero?.titleLine}
          </h1>

          <div className="bhl__search">
            <SearchBar
              placeholder={hero?.searchPlaceholder || "جستجو مقاله ..."}
              onSubmit={handleSearch}
            />
          </div>

          <div className="bhl__hint">
            <MouseIcon />
            <p>اسکرول کنید</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
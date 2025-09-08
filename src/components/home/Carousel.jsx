import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getFeaturedRestaurants } from "../../api/restaurants";
import LoadingSpinner from "../common/LoadingSpinner";

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const {
    data: slides,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["featuredRestaurants"],
    queryFn: getFeaturedRestaurants, // returns data directly
  });

  useEffect(() => {
    if (!slides || slides.length === 0) return;

    const goToNext = () => {
      const isLastSlide = currentIndex === slides.length - 1;
      const newIndex = isLastSlide ? 0 : currentIndex + 1;
      setCurrentIndex(newIndex);
    };

    const slideInterval = setInterval(goToNext, 3000);
    return () => clearInterval(slideInterval);
  }, [currentIndex, slides]);

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <section className="carousel">
        <p>Error: {error.message}</p>
      </section>
    );

  const goToSlide = (slideIndex) => setCurrentIndex(slideIndex);

  return (
    <section
      className="carousel"
      aria-live="polite"
      aria-label="Carousel navigation"
    >
      <div className="carousel-container" style={{ overflow: "hidden" }}>
        <div
          className="carousel-slider"
          role="list"
          style={{
            display: "flex",
            transition: "transform 0.5s ease",
            transform: `translateX(${currentIndex * 100}%)`,
          }}
        >
          {slides.map((slide) => (
            <div
              className="carousel-slide"
              key={`slide-${slide.id}`} // key on wrapper for React reconciliation
              style={{ flex: "0 0 100%" }} // exactly one viewport wide
            >
              <img
                key={slide.id}
                src={`http://localhost:5096${slide.carouselImageUrl}`}
                alt={slide.name}
                onClick={() => navigate(`/restaurant/${slide.slug}`)}
                style={{
                  display: "block",
                  width: "100%",
                  height: "380px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="indicators-container"
        role="navigation"
        aria-label="Slides"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {slides.map((_, slideIndex) => (
          <button
            key={slideIndex}
            className={
              currentIndex === slideIndex ? "indicator active" : "indicator"
            }
            onClick={() => goToSlide(slideIndex)}
            data-index={slideIndex}
            aria-label={`Go to slide ${slideIndex + 1}`}
            aria-current={currentIndex === slideIndex ? "true" : undefined}
          />
        ))}
        <img src="/images/curve.png" className="left-curve"></img>
        <img src="/images/curve.png" className="top-curve"></img>
      </div>
    </section>
  );
}

export default Carousel;

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedRestaurants } from "../../api/restaurants";
import LoadingSpinner from "../common/LoadingSpinner";

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Notice: No more `.then(res => res.data)` because getFeaturedRestaurants returns data directly
  const {
    data: slides,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["featuredRestaurants"],
    queryFn: getFeaturedRestaurants,
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

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <section
      className="carousel"
      aria-live="polite"
      aria-label="Carousel navigation"
    >
      <div className="carousel-container">
        <div
          className="carousel-slider"
          role="list"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <img
              key={slide.id}
              src={`http://localhost:5096${slide.carouselImageUrl}`}
              alt={slide.name}
              role="listitem"
            />
          ))}
        </div>
      </div>
      <div className="indicators-container" role="navigation">
        {slides.map((_, slideIndex) => (
          <button
            key={slideIndex}
            className={currentIndex === slideIndex ? "indicator active" : "indicator"}
            onClick={() => goToSlide(slideIndex)}
            data-index={slideIndex}
            aria-label={`Go to slide ${slideIndex + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default Carousel;

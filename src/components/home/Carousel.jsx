import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getFeaturedRestaurants } from "../../api/restaurants";
import LoadingSpinner from "../common/LoadingSpinner";
import publicAxios from "../../api/publicAxios";
import StateMessage from "../common/StateMessage";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);

  const containerRef = useRef(null);
  const sliderRef = useRef(null);

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

  const apiOrigin = new URL(publicAxios.defaults.baseURL).origin;
  const appOrigin = window.location.origin;
  const toAssetUrl = (url) => {
    if (!url) return `${appOrigin}/images/res-slider.jpg`;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const withSlash = url.startsWith("/") ? url : `/${url}`;
    if (withSlash.startsWith("/img/"))    return `${apiOrigin}${withSlash}`;   // backend wwwroot/img
    if (withSlash.startsWith("/images/")) return `${appOrigin}${withSlash}`;   // frontend public/images
    return `${appOrigin}${withSlash}`;
  };


  useEffect(() => {
    if (!slides || slides.length === 0 || isDragging) return;

    const goToNext = () => {
      const isLastSlide = currentIndex === slides.length - 1;
      const newIndex = isLastSlide ? 0 : currentIndex + 1;
      setCurrentIndex(newIndex);
    };

    const slideInterval = setInterval(goToNext, 3000);
    return () => clearInterval(slideInterval);z
  }, [currentIndex, slides, isDragging]);

  const goToSlide = (slideIndex) =>
    setCurrentIndex(clamp(slideIndex, 0, (slides?.length ?? 1) - 1));

  // Drag handlers
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragX(0);
    setDragStartTime(performance.now());
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // keep horizontal drag from scrolling the page
    setDragX(e.clientX - dragStartX);
  };

  const finishDrag = () => {
    if (!isDragging || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 1;
    const delta = dragX;
    const elapsed = Math.max(1, performance.now() - dragStartTime);
    const velocity = Math.abs(delta / elapsed);

    const thresholdPx = width * 0.18;
    const velocityThresh = 0.8 / 1000;

    // Start from current
    let next = currentIndex;

    // drag RIGHT => next (index+1), drag LEFT => prev (index-1)
    if (Math.abs(delta) > thresholdPx || velocity > velocityThresh) {
      const goingRight = delta > 0;
      next = goingRight ? currentIndex + 1 : currentIndex - 1;
    }

    setCurrentIndex(clamp(next, 0, (slides?.length ?? 1) - 1));
    setIsDragging(false);
    setDragX(0);
  };

  const onPointerUp = finishDrag;
  const onPointerCancel = finishDrag;
  const onPointerLeave = finishDrag;

  // ---- Early returns AFTER hooks ----
  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <section className="carousel">
        <div className="state state--error">خطا در دریافت اسلایدها</div>
      </section>
    );

  if (!slides || slides.length === 0) {
    return (
      <section className="carousel">
        <p>No slides available.</p>
      </section>
    );
  }

  // Direction-aware transform (no CSS changes)
  const containerWidth = containerRef.current?.clientWidth || 0;
  const dir =
    (sliderRef.current && getComputedStyle(sliderRef.current).direction) ||
    "ltr";
  const sign = dir === "rtl" ? +1 : -1;

  const trackTransform = `translate3d(${
    sign * currentIndex * containerWidth + (isDragging ? dragX : 0)
  }px, 0, 0)`;

  return (
    <section
      className="carousel"
      aria-live="polite"
      aria-label="Carousel navigation"
    >
      <div
        className="carousel-container"
        style={{ overflow: "hidden" }}
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerLeave}
      >
        <div
          className="carousel-slider"
          role="list"
          ref={sliderRef}
          style={{
            display: "flex",
            transition: isDragging ? "none" : "transform 0.5s ease",
            transform: trackTransform,
          }}
        >
          {slides.map((slide, idx) => (
            <div
              className="carousel-slide"
              // ensure this key is UNIQUE even if slide.id isn't
              key={`slide-${slide.slug || slide.id || idx}`}
              style={{ flex: "0 0 100%" }}
            >
              <img
                // src={`http://localhost:5096${slide.carouselImageUrl}`}
                src={toAssetUrl(slide.carouselImageUrl)}
                alt={slide.name}
                onClick={() => {
                  if (Math.abs(dragX) < 5)
                    navigate(`/restaurant/${slide.slug}`);
                }}
                draggable={false}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/res-slider.jpg"; // fallback you have in public/images
                }}
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
        style={{ display: "flex", justifyContent: "center", gap: 8 }}
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
        <img src="/images/curve.png" className="left-curve" />
        <img src="/images/curve.png" className="top-curve" />
      </div>
    </section>
  );
}

export default Carousel;

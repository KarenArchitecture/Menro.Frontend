// src/components/home/Carousel.jsx
import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getFeaturedRestaurants, postCarouselClick } from "../../api/restaurantAds";
import publicAxios from "../../api/publicAxios";
import StateMessage from "../common/StateMessage";
import ShimmerRow from "../common/ShimmerRow";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);

  const containerRef = useRef(null);
  const sliderRef = useRef(null);

  const navigate = useNavigate();

  const { data: slides, isLoading, isError } = useQuery({
    queryKey: ["featuredRestaurants"],
    queryFn: () => getFeaturedRestaurants(10),
    refetchOnWindowFocus: false,
  });

  const { mutate: sendCarouselClick } = useMutation({
    mutationFn: (adId) => postCarouselClick(adId),
  });

  const apiOrigin = new URL(publicAxios.defaults.baseURL).origin;
  const appOrigin = window.location.origin;
  const toAssetUrl = (url) => {
    if (!url) return `${appOrigin}/images/res-slider.jpg`;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const withSlash = url.startsWith("/") ? url : `/${url}`;
    if (withSlash.startsWith("/img/")) return `${apiOrigin}${withSlash}`;
    if (withSlash.startsWith("/images/")) return `${appOrigin}${withSlash}`;
    return `${appOrigin}${withSlash}`;
  };

  useEffect(() => {
    if (!slides || slides.length === 0 || isDragging) return;

    const goToNext = () => {
      const isLast = currentIndex === slides.length - 1;
      setCurrentIndex(isLast ? 0 : currentIndex + 1);
    };

    const t = setInterval(goToNext, 3000);
    return () => clearInterval(t);
  }, [currentIndex, slides, isDragging]);

  const goToSlide = (i) => setCurrentIndex(clamp(i, 0, (slides?.length ?? 1) - 1));

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
    e.preventDefault();
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

    let next = currentIndex;

    if (Math.abs(delta) > thresholdPx || velocity > velocityThresh) {
      const goingRight = delta > 0;
      next = goingRight ? currentIndex + 1 : currentIndex - 1;
    }

    setCurrentIndex(clamp(next, 0, (slides?.length ?? 1) - 1));
    setIsDragging(false);
    setDragX(0);
  };

  if (isLoading) return <ShimmerRow height={220} />;

  if (isError)
    return (
      <section className="carousel">
        <StateMessage kind="error" title="خطا در دریافت اطلاعات">
          خطایی در دریافت <span className="state-message-subject">اسلایدها</span> رخ داده است.
          <div className="state-message__action">
            <button onClick={() => window.location.reload()}>دوباره تلاش کنید</button>
          </div>
        </StateMessage>
      </section>
    );

  if (!slides || slides.length === 0)
    return (
      <section className="carousel">
        <StateMessage kind="empty" title="موردی یافت نشد">
          هیچ <span className="state-message-subject">اسلایدی</span> برای نمایش وجود ندارد.
        </StateMessage>
      </section>
    );

  const containerWidth = containerRef.current?.clientWidth || 0;
  const dir = (sliderRef.current && getComputedStyle(sliderRef.current).direction) || "ltr";
  const sign = dir === "rtl" ? +1 : -1;

  const trackTransform = `translate3d(${
    sign * currentIndex * containerWidth + (isDragging ? dragX : 0)
  }px, 0, 0)`;

  const handleSlideClick = (slide) => {
    if (Math.abs(dragX) >= 5) return;

    if (slide?.adId) sendCarouselClick(slide.adId);

    // targetUrl optional; otherwise slug route
    const t = slide?.targetUrl?.trim();
      if (t && (/^https?:\/\//i.test(t) || t.startsWith("/"))) {
        window.location.href = t;
        return;
      }

    navigate(`/restaurant/${slide.slug}`);
  };

  return (
    <section
      className={`carousel ${isDragging ? "carousel--dragging" : ""}`}
      aria-live="polite"
      aria-label="Carousel navigation"
    >
      <div
        className="carousel-container"
        style={{ overflow: "hidden" }}
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={finishDrag}
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
              key={`slide-${slide.adId ?? slide.slug ?? idx}`}
              style={{ flex: "0 0 100%" }}
            >
              <img
                src={toAssetUrl(slide.imageUrl)}
                alt={slide.restaurantName || "slide"}
                onClick={() => handleSlideClick(slide)}
                draggable={false}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/res-slider.jpg";
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
      >
        {slides.map((_, i) => (
          <button
            key={i}
            className={currentIndex === i ? "indicator active" : "indicator"}
            onClick={() => goToSlide(i)}
            data-index={i}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={currentIndex === i ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}

export default Carousel;

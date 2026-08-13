// src/components/home/Carousel.jsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getFeaturedRestaurants,
  postCarouselClick,
} from "../../api/restaurantAds";
import resolveFileUrl from "../../utils/resolveFileUrl";
import StateMessage from "../common/StateMessage";
import { CarouselSkeleton } from "./HomeSkeletons";

// 🔧 Below this many pixels of movement, a pointer gesture is still treated
// as a potential plain click/tap, not a drag — see onPointerMove for why
// this matters.
const DRAG_THRESHOLD_PX = 6;

function Carousel() {
  // start from FIRST REAL slide
  const [currentIndex, setCurrentIndex] = useState(1);

  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  // 🔧 Refs, not state, for bookkeeping that onPointerMove/onPointerUp need
  // to read synchronously on every event — avoids stale-closure timing
  // issues where a handler still sees the pre-update value because React
  // hadn't re-rendered between two pointer events fired in the same tick
  // (pointerdown → pointermove can happen before React ever flushes the
  // pointerdown's setState).
  const pointerActiveRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartTimeRef = useRef(0);

  const containerRef = useRef(null);
  const sliderRef = useRef(null);

  const navigate = useNavigate();

  const {
    data: rawSlides,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featuredRestaurants"],
    queryFn: () => getFeaturedRestaurants(10),
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  // infinite loop slides
  const slides = useMemo(() => {
    if (!rawSlides?.length) return [];

    return [
      rawSlides[rawSlides.length - 1], // fake first
      ...rawSlides,
      rawSlides[0], // fake last
    ];
  }, [rawSlides]);

  const { mutate: sendCarouselClick } = useMutation({
    mutationFn: (adId) => postCarouselClick(adId),
  });

  const toAssetUrl = (url) =>
    resolveFileUrl(url, "/images/ads/carousel-placeholder.jpg");

  // autoplay
  useEffect(() => {
    if (!slides?.length || isDragging) return;

    const t = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(t);
  }, [slides, isDragging]);

  // infinite loop correction
  useEffect(() => {
    if (!rawSlides?.length) return;

    const lastRealIndex = rawSlides.length;

    // reached fake last slide
    if (currentIndex === lastRealIndex + 1) {
      const timer = setTimeout(() => {
        if (!sliderRef.current) return;

        sliderRef.current.style.transition = "none";

        setCurrentIndex(1);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (sliderRef.current) {
              sliderRef.current.style.transition =
                "transform 0.5s ease";
            }
          });
        });
      }, 500);

      return () => clearTimeout(timer);
    }

    // reached fake first slide
    if (currentIndex === 0) {
      const timer = setTimeout(() => {
        if (!sliderRef.current) return;

        sliderRef.current.style.transition = "none";

        setCurrentIndex(lastRealIndex);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (sliderRef.current) {
              sliderRef.current.style.transition =
                "transform 0.5s ease";
            }
          });
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, rawSlides]);

  // indicators
  const goToSlide = (i) => {
    setCurrentIndex(i + 1);
  };

  // dragging
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.currentTarget.setPointerCapture?.(e.pointerId);

    // 🔧 Do NOT set isDragging true here. We only know the user's intent
    // once real movement happens (see onPointerMove) — jumping straight to
    // "dragging" on pointerdown alone is what caused onPointerMove's
    // preventDefault() to fire on the tiniest sub-pixel jitter that even a
    // stationary click naturally produces, which silently suppresses the
    // browser's own click event on pointerup.
    pointerActiveRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartTimeRef.current = performance.now();
    setDragX(0);
  };

  const onPointerMove = (e) => {
    if (!pointerActiveRef.current) return;

    const delta = e.clientX - dragStartXRef.current;

    if (!isDragging) {
      // Still under the threshold — this might just be a click's natural
      // micro-jitter. Don't preventDefault, don't touch dragX, and let the
      // browser's click event fire normally if the pointer lifts here.
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;

      // Threshold crossed — NOW this is really a drag.
      setIsDragging(true);
    }

    e.preventDefault();
    setDragX(delta);
  };

  const finishDrag = () => {
    const wasDragging = isDragging;
    const delta = dragX;

    pointerActiveRef.current = false;

    if (!wasDragging) {
      // Never crossed the drag threshold — this was a click/tap. Nothing
      // to do here; the browser's own click event on the slide image
      // handles navigation (see handleSlideClick).
      return;
    }

    if (!containerRef.current) {
      setIsDragging(false);
      setDragX(0);
      return;
    }

    const width = containerRef.current.clientWidth || 1;
    const elapsed = Math.max(1, performance.now() - dragStartTimeRef.current);
    const velocity = Math.abs(delta / elapsed);

    const thresholdPx = width * 0.18;
    const velocityThresh = 0.8 / 1000;

    let next = currentIndex;

    if (Math.abs(delta) > thresholdPx || velocity > velocityThresh) {
      const goingRight = delta > 0;
      next = goingRight ? currentIndex + 1 : currentIndex - 1;
    }

    setCurrentIndex(next);
    setIsDragging(false);
    setDragX(0);
  };

  // loading
  if (isLoading) {
    return <CarouselSkeleton height={300} />;
  }

  // error
  if (isError) {
    return (
      <section className="carousel">
        <StateMessage
          kind="error"
          title="خطا در دریافت اطلاعات"
        >
          خطایی در دریافت{" "}
          <span className="state-message-subject">
            اسلایدها
          </span>{" "}
          رخ داده است.

          <div className="state-message__action">
            <button
              onClick={() => window.location.reload()}
            >
              دوباره تلاش کنید
            </button>
          </div>
        </StateMessage>
      </section>
    );
  }

  // empty
  if (!rawSlides || rawSlides.length === 0) {
    return (
      <section className="carousel">
        <StateMessage
          kind="empty"
          title="موردی یافت نشد"
        >
          هیچ{" "}
          <span className="state-message-subject">
            اسلایدی
          </span>{" "}
          برای نمایش وجود ندارد.
        </StateMessage>
      </section>
    );
  }

  // transform
  const containerWidth =
    containerRef.current?.clientWidth || 0;

  const dir =
    (sliderRef.current &&
      getComputedStyle(sliderRef.current).direction) ||
    "ltr";

  const sign = dir === "rtl" ? +1 : -1;

  const trackTransform = `translate3d(${
    sign * currentIndex * containerWidth +
    (isDragging ? dragX : 0)
  }px, 0, 0)`;

  // click
  const handleSlideClick = (slide) => {
    // 🔧 dragX is now only ever non-zero while a real drag (past the
    // threshold) is in progress, so this guard is mostly a belt-and-braces
    // check now — the real fix is that a plain click no longer gets its
    // click event eaten in the first place.
    if (isDragging || Math.abs(dragX) >= DRAG_THRESHOLD_PX) return;

    if (slide?.adId) {
      sendCarouselClick(slide.adId);
    }

    const t = slide?.targetUrl?.trim();

    if (
      t &&
      (/^https?:\/\//i.test(t) ||
        t.startsWith("/"))
    ) {
      window.location.href = t;
      return;
    }

    navigate(`/restaurant/${slide.slug}`);
  };

  return (
    <section
      className={`carousel ${
        isDragging ? "carousel--dragging" : ""
      }`}
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
            transition: isDragging
              ? "none"
              : "transform 0.5s ease",
            transform: trackTransform,
          }}
        >
          {slides.map((slide, idx) => (
            <div
              className="carousel-slide"
              key={`slide-${
                slide.adId ?? slide.slug ?? idx
              }-${idx}`}
              style={{
                flex: "0 0 100%",
              }}
            >
              <img
                src={toAssetUrl(slide.imageUrl)}
                alt={slide.restaurantName || "slide"}
                draggable={false}
                onClick={() =>
                  handleSlideClick(slide)
                }
                onError={(e) => {
                  e.currentTarget.onerror = null;

                  e.currentTarget.src =
                    "/images/ads/carousel-placeholder.jpg";
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
        {rawSlides.map((_, i) => (
          <button
            key={i}
            className={
              (currentIndex -
                1 +
                rawSlides.length) %
                rawSlides.length ===
              i
                ? "indicator active"
                : "indicator"
            }
            onClick={() => goToSlide(i)}
            data-index={i}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={
              (currentIndex -
                1 +
                rawSlides.length) %
                rawSlides.length ===
              i
                ? "true"
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}

export default Carousel;

// src/components/home/AdBanner.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdBanner } from "../../api/restaurants";

export default function AdBanner({
  imageSrc,
  title,
  subtitle,
  href,
  overlay = 0.45,
  height = 260,
  objectPosition = "center",
  maxWidth = 920,
  fallbackImage = "/images/ad-banner-1.jpg",
}) {
  // Only fetch from API when no static image was provided
  const {
    data: ad,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adBanner"],
    queryFn: getAdBanner,
    enabled: !imageSrc, // 🔑 disable fetch if we have a static image
  });

  // Loading / error states only matter when we're fetching
  if (!imageSrc && isLoading) {
    return <p className="text-gray-500 text-center">در حال بارگذاری بنر...</p>;
  }
  if (!imageSrc && isError) {
    return (
      <p className="text-red-500 text-center">
        خطا در دریافت بنر: {error.message}
      </p>
    );
  }

  // Compute final data from props first, then API, then safe fallbacks
  const finalImg =
    imageSrc ||
    (ad?.imageUrl
      ? ad.imageUrl.startsWith("http")
        ? ad.imageUrl
        : `http://localhost:5096${ad.imageUrl}`
      : fallbackImage);

  const finalTitle = title ?? ad?.restaurantName ?? "";
  const finalSubtitle =
    subtitle ?? ad?.subtitle ?? "ماکتیل‌هامون رو از دست ندید!";
  const finalHref = href ?? (ad?.slug ? `/restaurant/${ad.slug}` : undefined);

  // If nothing to show at all (very unlikely), bail out gracefully
  if (!finalImg && !finalTitle && !finalSubtitle) {
    return (
      <p className="text-yellow-500 text-center">
        اطلاعات بنر ناقص است یا یافت نشد
      </p>
    );
  }

  const Wrapper = finalHref ? "a" : "div";

  // Inline CSS variables for easy theming from props
  const styleVars = {
    "--overlay-opacity": overlay,
    "--banner-height":
      typeof height === "number" ? `${height}px` : height || "auto",
    "--banner-max-w":
      typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth || "100%",
    "--object-position": objectPosition,
  };

  return (
    <section
      className="single-banner"
      aria-label={finalTitle || "بنر تبلیغاتی"}
      style={styleVars}
    >
      <Wrapper href={finalHref} className="banner-link">
        <div className="banner-content">
          <img
            src={finalImg}
            alt={finalTitle || "بنر تبلیغاتی"}
            className="single-banner-img"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />
          <div className="banner-overlay" aria-hidden="true" />
          {(finalTitle || finalSubtitle) && (
            <div className="banner-text banner-text--right">
              {finalTitle && <h2 className="banner-title">{finalTitle}</h2>}
              {finalSubtitle && <p className="banner-sub">{finalSubtitle}</p>}
            </div>
          )}
        </div>
      </Wrapper>
    </section>
  );
}

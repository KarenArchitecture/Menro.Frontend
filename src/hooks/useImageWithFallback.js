// src/hooks/useImageWithFallback.js
import { useState, useEffect } from "react";
import fallbackImages from "../assets/img/fallback";

/**
 * Returns a usable image URL, falling back to the fallback image registered
 * under `fallbackKey` (see src/assets/img/fallback/index.js) when `src` is
 * missing (null/undefined) or fails to load (broken/404).
 *
 * Usage: useImageWithFallback(resolveFileUrl(banner.bannerImageUrl), "shop-banner")
 */
export default function useImageWithFallback(src, fallbackKey) {
  const fallback = fallbackImages[fallbackKey];

  if (!fallback && process.env.NODE_ENV !== "production") {
    console.warn(
      `useImageWithFallback: no fallback registered for key "${fallbackKey}"`,
    );
  }

  const [url, setUrl] = useState(src || fallback);

  useEffect(() => {
    if (!src) {
      setUrl(fallback);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setUrl(src);
    };
    img.onerror = () => {
      if (!cancelled) setUrl(fallback);
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, fallback]);

  return url;
}

// src/components/common/AdBanner.jsx
import React, { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import resolveFileUrl from "../../utils/resolveFileUrl";
import {
  getRandomAdBanner,
  postAdImpression,
  postAdClick,
} from "../../api/restaurantAds";
import StateMessage from "./StateMessage";
import { Link } from "react-router-dom";
import SmartImage from "./SmartImage";
import { BannerSkeleton } from "../home/HomeSkeletons";
import "../../assets/css/styles-adbanner.css";
// Exclude list for banners (page-scope memory) -> AdIds
if (!window.__menroBannerExcludeAdIds) window.__menroBannerExcludeAdIds = [];

// ✅ GLOBAL DEDUPE (AdId) - survives remounts in this tab
const IMPRESSION_STORE_KEY = "__menro_impressed_adIds_v1";

// init global Set from sessionStorage once
if (!window.__menroImpressedAdIds) {
  let seed = [];
  try {
    seed = JSON.parse(sessionStorage.getItem(IMPRESSION_STORE_KEY) || "[]");
    if (!Array.isArray(seed)) seed = [];
  } catch {
    seed = [];
  }
  window.__menroImpressedAdIds = new Set(seed);
}

function markImpressed(adId) {
  window.__menroImpressedAdIds.add(adId);
  try {
    sessionStorage.setItem(
      IMPRESSION_STORE_KEY,
      JSON.stringify(Array.from(window.__menroImpressedAdIds)),
    );
  } catch {
    // ignore storage errors
  }
}

function hasImpressed(adId) {
  return window.__menroImpressedAdIds.has(adId);
}

// Simple lock/queue to prevent concurrent banners from picking same AdId
let _bannerQueue = Promise.resolve();
function withBannerLock(fn) {
  const run = _bannerQueue.then(fn, fn);
  _bannerQueue = run.then(
    () => {},
    () => {},
  );
  return run;
}

// Only allow absolute URLs (http/https) or absolute paths (/...)
// Everything else (like "namakdoon") is ignored to prevent wrong routing.
function normalizeTargetUrl(raw) {
  const t = raw?.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/")) return t;
  return null;
}

export default function AdBanner({
  slotKey, // unique per banner slot

  // Static mode
  imageSrc,
  title,
  subtitle,
  href,

  // Style
  overlay = 0.45,
  height = 260,
  objectPosition = "center",
  maxWidth = 920,
  fallbackImage = "/images/ads/banner-placeholder.jpg",
}) {
  const isStatic = !!imageSrc || !!title || !!subtitle || !!href;

  const { mutate: sendImpression } = useMutation({
    mutationFn: (adId) => postAdImpression(adId),
  });

  const { mutate: sendClick } = useMutation({
    mutationFn: (adId) => postAdClick(adId),
  });

  const {
    data: ad,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["adBannerRandom", slotKey ?? "default"],
    enabled: !isStatic && !!slotKey,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,

    queryFn: () =>
      withBannerLock(async () => {
        const excludes = window.__menroBannerExcludeAdIds || [];
        const res = await getRandomAdBanner(excludes);

        // res can be null (204)
        if (res?.adId && !window.__menroBannerExcludeAdIds.includes(res.adId)) {
          window.__menroBannerExcludeAdIds.push(res.adId);
        }
        return res;
      }),
  });

  const resolveImg = (url) => resolveFileUrl(url, fallbackImage);

  // Impression tracking
  const rootRef = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
  }, [ad?.adId]);

  useEffect(() => {
    if (isStatic) return;
    if (!ad?.adId) return;

    // ✅ GLOBAL DEDUPE per AdId
    if (hasImpressed(ad.adId)) {
      firedRef.current = true;
      return;
    }

    const el = rootRef.current;
    if (!el) return;

    const VIEW_RATIO = 0.6;
    const VIEW_MS = 1000;
    let timer = null;

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (firedRef.current) return;

        const entry = entries[0];
        const viewable =
          entry.isIntersecting &&
          entry.intersectionRatio >= VIEW_RATIO &&
          document.visibilityState === "visible";

        if (viewable) {
          if (!timer) {
            timer = setTimeout(() => {
              if (!firedRef.current && document.visibilityState === "visible") {
                firedRef.current = true;
                markImpressed(ad.adId);
                sendImpression(ad.adId);
              }
            }, VIEW_MS);
          }
        } else {
          clearTimer();
        }
      },
      { threshold: [VIEW_RATIO] },
    );

    io.observe(el);

    return () => {
      clearTimer();
      io.disconnect();
    };
  }, [isStatic, ad?.adId, sendImpression]);

  // ---- UI states ----
  if (!isStatic && isLoading) {
    return <BannerSkeleton height={height} />;
  }

  if (!isStatic && isError) {
    return (
      <section className="single-banner">
        <StateMessage kind="error" title="خطا در دریافت بنر">
          خطایی در دریافت بنر رخ داده است.
          <div className="state-message__action">
            <button onClick={() => refetch()}>دوباره تلاش کنید</button>
          </div>
        </StateMessage>
      </section>
    );
  }

  // if (!isStatic && !ad) {
  //   return (
  //     <section className="single-banner">
  //       <StateMessage kind="empty" title="موردی یافت نشد">
  //         هیچ بنری برای نمایش وجود ندارد.
  //       </StateMessage>
  //     </section>
  //   );
  // }
  // ✅ If no ad exists, render nothing (no ugly empty state in feed)
  if (!isStatic && !ad) return null;

  // Final computed content
  const finalImg = isStatic
    ? imageSrc
    : resolveImg(ad?.imageUrl) || fallbackImage;
  const finalTitle = isStatic ? (title ?? "") : (ad?.restaurantName ?? "");
  const finalSubtitle = isStatic
    ? (subtitle ?? "")
    : (ad?.commercialText ?? "");

  const safeTarget = isStatic ? href : normalizeTargetUrl(ad?.targetUrl);
  const finalHref = isStatic
    ? href
    : (safeTarget ?? (ad?.slug ? `/restaurant/${ad.slug}` : undefined));

  const Wrapper = finalHref ? Link : "div";

  const styleVars = {
    "--overlay-opacity": overlay,
    "--banner-height":
      typeof height === "number" ? `${height}px` : height || "auto",
    "--banner-max-w":
      typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth || "100%",
    "--object-position": objectPosition,
  };

  const ImgWrapper = (
    <div className="banner-content">
      <SmartImage
        src={finalImg}
        fallback={fallbackImage}
        alt={finalTitle || "بنر تبلیغاتی"}
        className="single-banner-img"
        lazy={true}
      />

      <div className="banner-overlay" aria-hidden="true" />

      {(finalTitle || finalSubtitle) && (
        <div className="banner-text banner-text--right">
          {finalTitle && <h2 className="banner-title">{finalTitle}</h2>}
          {finalSubtitle && <p className="banner-sub">{finalSubtitle}</p>}
        </div>
      )}
    </div>
  );

  return (
    <section
      ref={isStatic ? undefined : rootRef}
      className="single-banner"
      aria-label={finalTitle || "Ad banner"}
      style={styleVars}
    >
      {finalHref ? (
        <Wrapper
          to={finalHref}
          className="banner-link"
          onClick={() => {
            if (!isStatic && ad?.adId) sendClick(ad.adId);
          }}
        >
          {ImgWrapper}
        </Wrapper>
      ) : (
        ImgWrapper
      )}
    </section>
  );
}

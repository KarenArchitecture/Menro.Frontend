// // src/components/home/AdBanner.jsx
// import React, { useEffect, useMemo, useRef } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import publicAxios from "../../api/publicAxios";
// import { getRandomAdBanner, postAdImpression } from "../../api/restaurants";
// import StateMessage from "../common/StateMessage";
// import { Link } from "react-router-dom";

// // page-scope memory so multiple AdBanner instances don't repeat
// if (!window.__menroAdExcludes) window.__menroAdExcludes = [];

// export default function AdBanner({
//   // Presentational props (if provided => render static)
//   imageSrc,
//   title,
//   subtitle,
//   href,

//   // Style knobs
//   overlay = 0.45,
//   height = 260,
//   objectPosition = "center",
//   maxWidth = 920,
//   fallbackImage = "/images/ad-banner-1.jpg",
// }) {
//   const isStatic = !!imageSrc || !!title || !!subtitle || !!href;

//   // For dynamic mode (random ad)
//   const excludes = useMemo(() => [...window.__menroAdExcludes], []);
//   const { data: ad, isLoading, isError, error } = useQuery({
//     queryKey: ["adBannerRandom", excludes],
//     queryFn: () => getRandomAdBanner(excludes),
//     enabled: !isStatic, // only fetch when no static content was provided
//   });

//   // Remember the chosen banner id to avoid duplicates on the same page
//   useEffect(() => {
//     if (!isStatic && ad?.id && !window.__menroAdExcludes.includes(ad.id)) {
//       window.__menroAdExcludes.push(ad.id);
//     }
//   }, [ad, isStatic]);

//   // Resolve image url from backend (/img/...) vs frontend (/images/...) vs absolute
//   const apiOrigin = new URL(publicAxios.defaults.baseURL).origin;
//   const appOrigin = window.location.origin;
//   const resolveImg = (url) => {
//     if (!url) return undefined;
//     if (url.startsWith("http://") || url.startsWith("https://")) return url;
//     const withSlash = url.startsWith("/") ? url : `/${url}`;
//     if (withSlash.startsWith("/img/")) return `${apiOrigin}${withSlash}`;     // backend wwwroot/img
//     if (withSlash.startsWith("/images/")) return `${appOrigin}${withSlash}`;  // frontend public/images
//     return `${appOrigin}${withSlash}`;
//   };

//   // Impression tracking (only for dynamic banners)
//   const rootRef = useRef(null);
//   const firedRef = useRef(false);
//   const { mutate: sendImpression } = useMutation({
//     mutationFn: (id) => postAdImpression(id),
//   });

//   useEffect(() => {
//     if (isStatic || !ad?.id) return;
//     const el = rootRef.current;
//     if (!el) return;

//     const io = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (!firedRef.current && entry.isIntersecting && entry.intersectionRatio >= 0.6) {
//             firedRef.current = true;
//             sendImpression(ad.id); // fire once when ≥60% visible
//           }
//         });
//       },
//       { threshold: [0.6] }
//     );

//     io.observe(el);
//     return () => io.disconnect();
//   }, [isStatic, ad?.id, sendImpression]);

//   // Loading / error for dynamic mode
//   if (!isStatic && isLoading) {
//   return <div className="state state--loading">در حال بارگذاری بنر…</div>;
//   }
//   if (!isStatic && isError) {
//     return <div className="state state--error">خطایی در دریافت بنر رخ داده است.</div>;
//   }
//   if (!isStatic && !ad) {
//     // API may return 204 (no eligible banners)
//     return null;
//   }

//   // Compute final content:
//   const finalImg = isStatic
//     ? imageSrc
//     : resolveImg(ad?.imageUrl) || fallbackImage;

//   const finalTitle = isStatic
//     ? title ?? ""
//     : ad?.restaurantName ?? "";

//   const finalSubtitle = isStatic
//     ? subtitle ?? "ماکتیل‌هامون رو از دست ندید!"
//     : ad?.commercialText ?? "";

//   const finalHref = isStatic
//     ? href
//     : ad?.slug
//     ? `/restaurant/${ad.slug}`
//     : undefined;

//   // If nothing to show at all (very unlikely), bail out gracefully
//   if (!finalImg && !finalTitle && !finalSubtitle) {
//     return <StateMessage kind="empty">اطلاعات بنر یافت نشد.</StateMessage>;
//   }

//   const Wrapper = finalHref ? Link : "div";

//   // Inline CSS variables for easy theming from props
//   const styleVars = {
//     "--overlay-opacity": overlay,
//     "--banner-height": typeof height === "number" ? `${height}px` : height || "auto",
//     "--banner-max-w": typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth || "100%",
//     "--object-position": objectPosition,
//   };

//   const ImgWrapper = (
//     <div className="banner-content">
//       <img
//         src={finalImg}
//         alt={finalTitle || "بنر تبلیغاتی"}
//         className="single-banner-img"
//         onError={(e) => {
//           e.currentTarget.onerror = null;
//           e.currentTarget.src = fallbackImage;
//         }}
//       />
//       <div className="banner-overlay" aria-hidden="true" />
//       {(finalTitle || finalSubtitle) && (
//         <div className="banner-text banner-text--right">
//           {finalTitle && <h2 className="banner-title">{finalTitle}</h2>}
//           {finalSubtitle && <p className="banner-sub">{finalSubtitle}</p>}
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <section
//       ref={isStatic ? undefined : rootRef}
//       className="single-banner"
//       aria-label={finalTitle || "بنر تبلیغاتی"}
//       style={styleVars}
//     >
//       {finalHref ? (
//   <Wrapper to={finalHref} className="banner-link">
//       {ImgWrapper}
//     </Wrapper>
//   ) : (
//     ImgWrapper
//   )}
//     </section>
//   );
// }

// src/components/home/AdBanner.jsx
import React, { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import publicAxios from "../../api/publicAxios";
import { getRandomAdBanner, postAdImpression, postAdClick } from "../../api/restaurantAds";
import StateMessage from "../common/StateMessage";
import { Link } from "react-router-dom";
import ShimmerRow from "../common/ShimmerRow";

// restaurantIds excludes (page-scope memory)
if (!window.__menroAdExcludes) window.__menroAdExcludes = [];

// Simple lock/queue to prevent concurrent banners from picking same restaurant
let _bannerQueue = Promise.resolve();
function withBannerLock(fn) {
  const run = _bannerQueue.then(fn, fn);
  _bannerQueue = run.then(() => {}, () => {});
  return run;
}

export default function AdBanner({
  // Static mode (if any provided => no backend call)
  imageSrc,
  title,
  subtitle,
  href,

  // Style
  overlay = 0.45,
  height = 260,
  objectPosition = "center",
  maxWidth = 920,
  fallbackImage = "/images/ad-banner-1.jpg",
}) {
  const isStatic = !!imageSrc || !!title || !!subtitle || !!href;

  const { mutate: sendImpression } = useMutation({
    mutationFn: (id) => postAdImpression(id),
  });

  const { mutate: sendClick } = useMutation({
    mutationFn: (id) => postAdClick(id),
  });

  const {
    data: ad,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["adBannerRandom"],
    enabled: !isStatic,
    queryFn: () =>
      withBannerLock(async () => {
        const excludes = window.__menroAdExcludes || []; // restaurantIds
        const res = await getRandomAdBanner(excludes);

        // Save restaurantId immediately to prevent duplicates
        if (res?.restaurantId && !window.__menroAdExcludes.includes(res.restaurantId)) {
          window.__menroAdExcludes.push(res.restaurantId);
        }
        return res;
      }),
  });

  // Resolve image url from backend (/img/...) vs frontend (/images/...) vs absolute
  const apiOrigin = new URL(publicAxios.defaults.baseURL).origin;
  const appOrigin = window.location.origin;
  const resolveImg = (url) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const withSlash = url.startsWith("/") ? url : `/${url}`;
    if (withSlash.startsWith("/img/")) return `${apiOrigin}${withSlash}`;
    if (withSlash.startsWith("/images/")) return `${appOrigin}${withSlash}`;
    return `${appOrigin}${withSlash}`;
  };

  // Impression tracking
  const rootRef = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (isStatic || !ad?.id) return;
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
                sendImpression(ad.id); // PerView id
              }
            }, VIEW_MS);
          }
        } else {
          clearTimer();
        }
      },
      { threshold: [VIEW_RATIO] }
    );

    io.observe(el);

    return () => {
      clearTimer();
      io.disconnect();
    };
  }, [isStatic, ad?.id, sendImpression]);

  // ---- UI states ----
  if (!isStatic && isLoading) return <ShimmerRow height={220} />;

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

  if (!isStatic && !ad) {
    // API returns 204 -> react-query will give undefined data
    return (
      <section className="single-banner">
        <StateMessage kind="empty" title="موردی یافت نشد">
          هیچ بنری برای نمایش وجود ندارد.
        </StateMessage>
      </section>
    );
  }

  // Final computed content
  const finalImg = isStatic ? imageSrc : resolveImg(ad?.imageUrl) || fallbackImage;
  const finalTitle = isStatic ? title ?? "" : ad?.restaurantName ?? "";
  const finalSubtitle = isStatic ? subtitle ?? "" : ad?.commercialText ?? "";
  const finalHref = isStatic ? href : ad?.slug ? `/restaurant/${ad.slug}` : undefined;

  const Wrapper = finalHref ? Link : "div";

  const styleVars = {
    "--overlay-opacity": overlay,
    "--banner-height": typeof height === "number" ? `${height}px` : height || "auto",
    "--banner-max-w": typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth || "100%",
    "--object-position": objectPosition,
  };

  const ImgWrapper = (
    <div className="banner-content">
      <img
        src={finalImg}
        alt={finalTitle || "بنر تبلیغاتی"}
        className="single-banner-img"
        onError={(e) => {
          e.currentTarget.onerror = null;
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
  );

  return (
    <section
      ref={isStatic ? undefined : rootRef}
      className="single-banner"
      aria-label={finalTitle || "بنر تبلیغاتی"}
      style={styleVars}
    >
      {finalHref ? (
        <Wrapper
          to={finalHref}
          className="banner-link"
          onClick={() => {
            if (!isStatic && ad?.id) sendClick(ad.id); // PerView id -> backend finds paired PerClick
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

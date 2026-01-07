// // src/components/home/PopularFoodAndAdBannerLazyList.jsx
// import React, { useEffect, useRef } from "react";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { getPopularFoodByRandomCategory, getPopularFoodByRandomCategoryExcluding } from "../../api/foods";
// import PopularFoodRow from "./PopularFoodRow";
// import AdBanner from "./AdBanner";
// import LoadingSpinner from "../common/LoadingSpinner";
// import StateMessage from "../common/StateMessage";

// export default function PopularFoodAndAdBannerLazyList() {
//   const loadMoreRef = useRef(null);

//   const {
//     data,
//     fetchNextPage,
//     isFetchingNextPage,
//     isLoading,
//     isError,
//     error,
//     hasNextPage,
//   } = useInfiniteQuery({
//     queryKey: ["popularFoodLazyLoad"],
//     queryFn: ({ pageParam = [] }) =>
//       pageParam.length === 0
//         ? getPopularFoodByRandomCategory()
//         : getPopularFoodByRandomCategoryExcluding(pageParam),
//     getNextPageParam: (lastPage, allPages) => {
//       if (!lastPage) return undefined; // backend returned null => stop
//       const loadedTitles = allPages
//         .map((p) => p?.categoryTitle)
//         .filter(Boolean);
//       return loadedTitles; // exclude already used next time
//     },
//   });

//   // intersection observer for infinite load
//   useEffect(() => {
//     if (!loadMoreRef.current || !hasNextPage) return;
//     const io = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && !isFetchingNextPage) {
//           fetchNextPage();
//         }
//       },
//       { threshold: 1.0 }
//     );
//     io.observe(loadMoreRef.current);
//     return () => io.disconnect();
//   }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

//   if (isLoading) return <LoadingSpinner />;
//   if (isError)
//     return <div className="state state--error">خطا در بارگذاری آیتم‌های پرطرفدار</div>;

//   // de-dupe categories across pages
//   const pages = (data?.pages ?? []).filter(Boolean);
//   const uniquePages = [];
//   const seen = new Set();
//   for (const p of pages) {
//     if (!seen.has(p.categoryTitle)) {
//       uniquePages.push(p);
//       seen.add(p.categoryTitle);
//     }
//   }

//   // interleave: every 2 sections -> an AdBanner
//   const feed = [];

//   // push first ad banner
//   feed.push({ type: "ad", key: `ad-start` });

//   uniquePages.forEach((page, idx) => {
//     feed.push({ type: "popular", payload: page, key: `cat-${page.categoryTitle}` });
//     // after every 2 popular rows, push an ad
//     if ((idx + 1) % 2 === 0) {
//       feed.push({ type: "ad", key: `ad-${idx}` });
//     }
//   });

//   return (
//     <>
//       {feed.map((block) =>
//         block.type === "popular" ? (
//           <PopularFoodRow key={block.key} data={block.payload} />
//         ) : (
//           <AdBanner key={block.key} height={260} overlay={0.5} objectPosition="center" />
//         )
//       )}

//       {isFetchingNextPage && <LoadingSpinner />}

//       {hasNextPage && (
//         <div ref={loadMoreRef} style={{ height: 1, marginTop: -1 }} aria-hidden="true" />
//       )}
//     </>
//   );
// }

// src/components/home/PopularFoodAndAdBannerLazyList.jsx
// import React, { useEffect, useRef } from "react";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { getPopularFoodByRandomCategory, getPopularFoodByRandomCategoryExcluding } from "../../api/foods";
// import PopularFoodRow from "./PopularFoodRow";
// import AdBanner from "./AdBanner";
// import LoadingSpinner from "../common/LoadingSpinner";
// import StateMessage from "../common/StateMessage";

// export default function PopularFoodAndAdBannerLazyList() {
//   const loadMoreRef = useRef(null);

//   const {
//     data,
//     fetchNextPage,
//     isFetchingNextPage,
//     isLoading,
//     isError,
//     error,
//     hasNextPage,
//   } = useInfiniteQuery({
//     queryKey: ["popularFoodLazyLoad"],
//     queryFn: ({ pageParam = [] }) =>
//       pageParam.length === 0
//         ? getPopularFoodByRandomCategory()
//         : getPopularFoodByRandomCategoryExcluding(pageParam),
//     getNextPageParam: (lastPage, allPages) => {
//       if (!lastPage) return undefined;
//       const loadedTitles = allPages.map((p) => p?.categoryTitle).filter(Boolean);
//       return loadedTitles;
//     },
//   });

//   // Intersection observer for infinite load
//   useEffect(() => {
//     if (!loadMoreRef.current || !hasNextPage) return;
//     const io = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && !isFetchingNextPage) {
//           fetchNextPage();
//         }
//       },
//       { threshold: 1.0 }
//     );
//     io.observe(loadMoreRef.current);
//     return () => io.disconnect();
//   }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

//   // ───────────── Initial Loading ─────────────
//   if (isLoading) return <LoadingSpinner />;

//   // ───────────── Error ─────────────
//   if (isError) {
//     return (
//       <StateMessage kind="error" title="خطا در بارگذاری آیتم‌های پرطرفدار">
//         مشکلی در دریافت اطلاعات رخ داده است.
//         <div className="state-message__action">
//           <button onClick={() => window.location.reload()}>دوباره تلاش کنید</button>
//         </div>
//       </StateMessage>
//     );
//   }

//   // ───────────── Empty ─────────────
//   const pages = (data?.pages ?? [])
//   .flat()
//   .filter(Boolean);
//   if (!pages || pages.length === 0) {
//     return (
//       <StateMessage kind="empty" title="موردی یافت نشد">
//         آیتمی برای نمایش موجود نیست.
//       </StateMessage>
//     );
//   }

//   // ───────────── Deduplicate categories ─────────────
//   const uniquePages = [];
//   const seen = new Set();
//   for (const p of pages) {
//     if (!seen.has(p.categoryTitle)) {
//       uniquePages.push(p);
//       seen.add(p.categoryTitle);
//     }
//   }

//   // ───────────── Interleave AdBanners ─────────────
//   const feed = [];
//   feed.push({ type: "ad", key: `ad-start` });
//   uniquePages.forEach((page, idx) => {
//     feed.push({ type: "popular", payload: page, key: `cat-${page.categoryTitle}` });
//     if ((idx + 1) % 2 === 0) feed.push({ type: "ad", key: `ad-${idx}` });
//   });

//   return (
//     <>
//       {feed.map((block) =>
//         block.type === "popular" ? (
//           <PopularFoodRow key={block.key} data={block.payload} />
//         ) : (
//           <AdBanner key={block.key} height={260} overlay={0.5} objectPosition="center" />
//         )
//       )}

//       {/* ───────────── Lazy Load Spinner ───────────── */}
//       {isFetchingNextPage && <LoadingSpinner />}

//       {hasNextPage && (
//         <div ref={loadMoreRef} style={{ height: 1, marginTop: -1 }} aria-hidden="true" />
//       )}
//     </>
//   );
// }

// src/components/home/PopularFoodAndAdBannerLazyList.jsx
// src/components/home/PopularFoodAndAdBannerLazyList.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getPopularFoodByRandomCategory,
  getPopularFoodByRandomCategoryExcluding,
} from "../../api/foods";
import PopularFoodRow from "./PopularFoodRow";
import AdBanner from "./AdBanner";
import LoadingSpinner from "../common/LoadingSpinner";
import StateMessage from "../common/StateMessage";

const normalizeFa = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();

export default function PopularFoodAndAdBannerLazyList({
  searchQuery = "",
  showAds = true,
}) {
  const loadMoreRef = useRef(null);

  const q = useMemo(() => normalizeFa(searchQuery), [searchQuery]);
  const isSearchMode = Boolean(q);
  const effectiveShowAds = showAds && !isSearchMode;

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["popularFoodLazyLoad"],
    queryFn: ({ pageParam = [] }) =>
      pageParam.length === 0
        ? getPopularFoodByRandomCategory()
        : getPopularFoodByRandomCategoryExcluding(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      const loadedTitles = allPages
        .map((p) => p?.categoryTitle)
        .filter(Boolean);
      return loadedTitles;
    },
    staleTime: 60_000,
    retry: 1,
  });

  // Normalize pages (supports API returning either object or array per page)
  const pages = useMemo(() => {
    const raw = data?.pages ?? [];
    const out = [];
    for (const entry of raw) {
      if (Array.isArray(entry)) out.push(...entry);
      else if (entry) out.push(entry);
    }
    return out.filter(Boolean);
  }, [data]);

  // Deduplicate categories by title
  const uniquePages = useMemo(() => {
    const out = [];
    const seen = new Set();
    for (const p of pages) {
      const key = p?.categoryTitle || "__no_title__";
      if (!seen.has(key)) {
        out.push(p);
        seen.add(key);
      }
    }
    return out;
  }, [pages]);

  // Search-mode: flatten foods from loaded popular rows and filter by name
  const matchedFoods = useMemo(() => {
    if (!isSearchMode) return [];
    const results = [];
    for (const p of uniquePages) {
      const foods = Array.isArray(p?.foods) ? p.foods : [];
      for (const f of foods) {
        if (!f) continue;
        if (normalizeFa(f?.name).includes(q)) results.push(f);
      }
    }
    return results;
  }, [uniquePages, isSearchMode, q]);

  // Normal-mode feed: interleave ads
  const feed = useMemo(() => {
    if (isSearchMode) return [];
    const blocks = [];
    if (effectiveShowAds) blocks.push({ type: "ad", key: "ad-start" });

    uniquePages.forEach((page, idx) => {
      blocks.push({
        type: "popular",
        payload: page,
        key: `cat-${page.categoryTitle ?? idx}`,
      });
      if (effectiveShowAds && (idx + 1) % 2 === 0) {
        blocks.push({ type: "ad", key: `ad-${idx}` });
      }
    });

    return blocks;
  }, [uniquePages, effectiveShowAds, isSearchMode]);

  // Intersection observer for infinite load (still works in both modes)
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    io.observe(loadMoreRef.current);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ───────────── Initial Loading ─────────────
  if (isLoading) return <LoadingSpinner />;

  // ───────────── Error ─────────────
  if (isError) {
    return (
      <StateMessage kind="error" title="خطا در بارگذاری آیتم‌های پرطرفدار">
        مشکلی در دریافت اطلاعات رخ داده است.
        <div className="state-message__action">
          <button onClick={() => refetch()}>دوباره تلاش کنید</button>
        </div>
      </StateMessage>
    );
  }

  // ───────────── Empty (base) ─────────────
  if (!pages.length) {
    return (
      <StateMessage kind="empty" title="موردی یافت نشد">
        آیتمی برای نمایش موجود نیست.
      </StateMessage>
    );
  }

  // ───────────── SEARCH MODE: one list, popular-food format ─────────────
  if (isSearchMode) {
    const noResults = matchedFoods.length === 0 && !isFetchingNextPage;

    return (
      <>
        {noResults ? (
          <StateMessage kind="empty" title="موردی یافت نشد">
            نتیجه‌ای برای جستجوی شما پیدا نشد.
          </StateMessage>
        ) : (
          <PopularFoodRow
            data={{ categoryTitle: "", foods: matchedFoods }}
            hideTitle
            isSearchMode
          />
        )}

        {isFetchingNextPage && <LoadingSpinner />}

        {hasNextPage && (
          <div
            ref={loadMoreRef}
            style={{ height: 1, marginTop: -1 }}
            aria-hidden="true"
          />
        )}
      </>
    );
  }

  // ───────────── NORMAL MODE ─────────────
  return (
    <>
      {feed.map((block) =>
        block.type === "popular" ? (
          <PopularFoodRow key={block.key} data={block.payload} />
        ) : (
          <AdBanner
            key={block.key}
            height={260}
            overlay={0.5}
            objectPosition="center"
          />
        )
      )}

      {isFetchingNextPage && <LoadingSpinner />}

      {hasNextPage && (
        <div
          ref={loadMoreRef}
          style={{ height: 1, marginTop: -1 }}
          aria-hidden="true"
        />
      )}
    </>
  );
}

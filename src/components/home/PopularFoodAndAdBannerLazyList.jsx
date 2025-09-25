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
//   uniquePages.forEach((page, idx) => {
//     feed.push({ type: "popular", payload: page, key: `cat-${page.categoryTitle}` });
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
import React, { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPopularFoodByRandomCategory, getPopularFoodByRandomCategoryExcluding } from "../../api/foods";
import PopularFoodRow from "./PopularFoodRow";
import AdBanner from "./AdBanner";
import LoadingSpinner from "../common/LoadingSpinner";
import StateMessage from "../common/StateMessage";

export default function PopularFoodAndAdBannerLazyList() {
  const loadMoreRef = useRef(null);

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["popularFoodLazyLoad"],
    queryFn: ({ pageParam = [] }) =>
      pageParam.length === 0
        ? getPopularFoodByRandomCategory()
        : getPopularFoodByRandomCategoryExcluding(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined; // backend returned null => stop
      const loadedTitles = allPages
        .map((p) => p?.categoryTitle)
        .filter(Boolean);
      return loadedTitles; // exclude already used next time
    },
  });

  // intersection observer for infinite load
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

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <div className="state state--error">خطا در بارگذاری آیتم‌های پرطرفدار</div>;

  // de-dupe categories across pages
  const pages = (data?.pages ?? []).filter(Boolean);
  const uniquePages = [];
  const seen = new Set();
  for (const p of pages) {
    if (!seen.has(p.categoryTitle)) {
      uniquePages.push(p);
      seen.add(p.categoryTitle);
    }
  }

  // interleave: every 2 sections -> an AdBanner
  const feed = [];

  // push first ad banner
  feed.push({ type: "ad", key: `ad-start` });

  uniquePages.forEach((page, idx) => {
    feed.push({ type: "popular", payload: page, key: `cat-${page.categoryTitle}` });
    // after every 2 popular rows, push an ad
    if ((idx + 1) % 2 === 0) {
      feed.push({ type: "ad", key: `ad-${idx}` });
    }
  });

  return (
    <>
      {feed.map((block) =>
        block.type === "popular" ? (
          <PopularFoodRow key={block.key} data={block.payload} />
        ) : (
          <AdBanner key={block.key} height={260} overlay={0.5} objectPosition="center" />
        )
      )}

      {isFetchingNextPage && <LoadingSpinner />}

      {hasNextPage && (
        <div ref={loadMoreRef} style={{ height: 1, marginTop: -1 }} aria-hidden="true" />
      )}
    </>
  );
}

// import React, { useEffect, useRef } from "react";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { getPopularFoodByRandomCategory, getPopularFoodByRandomCategoryExcluding } from "../../api/foods"; // Ensure this path is correct
// import PopularFoodRow from "../home/PopularFoodRow";
// import LoadingSpinner from "../common/LoadingSpinner";

// function PopularFoodLazyList() {
//   const loadMoreRef = useRef();

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
//     queryFn: ({ pageParam = [] }) => {
//       // pageParam is an array of already loaded category titles to exclude
//       if (pageParam.length === 0) {
//         // First call: no exclusions
//         return getPopularFoodByRandomCategory();
//       } else {
//         // Subsequent calls: exclude already fetched categories
//         return getPopularFoodByRandomCategoryExcluding(pageParam);
//       }
//     },
//     getNextPageParam: (lastPage, allPages) => {
//       if (!lastPage) return undefined;

//       const loadedCategories = allPages.map((p) => p.categoryTitle);

//       // Check if there are still categories left to fetch by calling backend with exclusion
//       // If lastPage is null or empty, no more categories
//       // Since backend returns null if none left, check that:
//       if (lastPage.categoryTitle === "" || lastPage === null) {
//         return undefined; // no next page
//       }

//       // If category was returned, pass loaded category titles to exclude next time
//       return loadedCategories;
//     },
//   });

//   useEffect(() => {
//     if (!loadMoreRef.current || !hasNextPage) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && !isFetchingNextPage) {
//           fetchNextPage();
//         }
//       },
//       { threshold: 1.0 }
//     );

//     observer.observe(loadMoreRef.current);

//     return () => {
//       if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
//       observer.disconnect();
//     };
//   }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

//   if (isLoading) return <LoadingSpinner />;

//   if (isError)
//     return (
//       <p className="text-center text-red-600 my-6">
//         خطا در بارگذاری آیتم‌های پرطرفدار: {error.message}
//       </p>
//     );

//   // Remove duplicate categories
//   const uniquePages = [];
//   const seen = new Set();
//   for (const page of data.pages) {
//     if (page && !seen.has(page.categoryTitle)) {
//       uniquePages.push(page);
//       seen.add(page.categoryTitle);
//     }
//   }

//   return (
//     <>
//       {uniquePages.map((page, index) => (
//         <PopularFoodRow key={index} data={page} />
//       ))}

//       {isFetchingNextPage && <LoadingSpinner />}

//       {hasNextPage && (
//         <div
//           ref={loadMoreRef}
//           style={{ height: "1px", marginTop: "-1px" }}
//           aria-hidden="true"
//         />
//       )}

//       {!hasNextPage && (
//         <p className="text-center text-gray-500 my-6">
//           {/* All categories loaded message here */}
//         </p>
//       )}
//     </>
//   );
// }

// export default PopularFoodLazyList;


// src/components/home/PopularFoodAndAdBannerLazyList.jsx
import React, { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getPopularFoodByRandomCategory,
  getPopularFoodByRandomCategoryExcluding,
} from "../../api/foods";
import PopularFoodRow from "./PopularFoodRow";
import AdBanner from "./AdBanner";
import LoadingSpinner from "../common/LoadingSpinner";

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
    return (
      <p className="text-center text-red-600 my-6">
        خطا در بارگذاری آیتم‌های پرطرفدار: {error.message}
      </p>
    );

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
  uniquePages.forEach((page, idx) => {
    feed.push({ type: "popular", payload: page, key: `cat-${page.categoryTitle}` });
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

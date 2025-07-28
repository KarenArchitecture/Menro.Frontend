import React, { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPopularFoodByRandomCategory, getPopularFoodByRandomCategoryExcluding } from "../../api/foods"; // Ensure this path is correct
import PopularFoodRow from "../home/PopularFoodRow";
import LoadingSpinner from "../common/LoadingSpinner";

function PopularFoodLazyList() {
  const loadMoreRef = useRef();

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
    queryFn: ({ pageParam = [] }) => {
      // pageParam is an array of already loaded category titles to exclude
      if (pageParam.length === 0) {
        // First call: no exclusions
        return getPopularFoodByRandomCategory();
      } else {
        // Subsequent calls: exclude already fetched categories
        return getPopularFoodByRandomCategoryExcluding(pageParam);
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;

      const loadedCategories = allPages.map((p) => p.categoryTitle);

      // Check if there are still categories left to fetch by calling backend with exclusion
      // If lastPage is null or empty, no more categories
      // Since backend returns null if none left, check that:
      if (lastPage.categoryTitle === "" || lastPage === null) {
        return undefined; // no next page
      }

      // If category was returned, pass loaded category titles to exclude next time
      return loadedCategories;
    },
  });

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <p className="text-center text-red-600 my-6">
        خطا در بارگذاری آیتم‌های پرطرفدار: {error.message}
      </p>
    );

  // Remove duplicate categories
  const uniquePages = [];
  const seen = new Set();
  for (const page of data.pages) {
    if (page && !seen.has(page.categoryTitle)) {
      uniquePages.push(page);
      seen.add(page.categoryTitle);
    }
  }

  return (
    <>
      {uniquePages.map((page, index) => (
        <PopularFoodRow key={index} data={page} />
      ))}

      {isFetchingNextPage && <LoadingSpinner />}

      {hasNextPage && (
        <div
          ref={loadMoreRef}
          style={{ height: "1px", marginTop: "-1px" }}
          aria-hidden="true"
        />
      )}

      {!hasNextPage && (
        <p className="text-center text-gray-500 my-6">
          {/* All categories loaded message here */}
        </p>
      )}
    </>
  );
}

export default PopularFoodLazyList;

import React, { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPopularFoodByRandomCategory } from "../../api/foods"; // Ensure this path is correct
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
    queryFn: getPopularFoodByRandomCategory,  // <-- unwrap axios data here
    getNextPageParam: (_lastPage, allPages) => {
      const titles = allPages.map((p) => p.categoryTitle);
      const uniqueTitles = new Set(titles);

      if (uniqueTitles.size < allPages.length) {
        return undefined; // No more pages
      }

      return allPages.length; // Next page index
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
    if (!seen.has(page.categoryTitle)) {
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

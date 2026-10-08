// src/components/home/PopularFoodAndAdBannerLazyList.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getPopularFoodByRandomCategory,
  getPopularFoodByRandomCategoryExcluding,
} from "../../api/foods";
import PopularFoodRow from "./PopularFoodRow";
import AdBanner from "../common/AdBanner";
import { FoodCardsSkeleton, BannerSkeleton } from "./HomeSkeletons";
import StateMessage from "../common/StateMessage";
import usePagedSearch from "../../hooks/usePagedSearch";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { normalizeFa } from "../../utils/normalizeFa";
import { mapSearchFood } from "../../utils/searchMappers";

function SearchModeFoods({ q, categoryId, onSearchCount }) {
  const {
    items: foods,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = usePagedSearch({
    term: q,
    type: "Food",
    categoryId,
    map: mapSearchFood,
  });

  const sentinelRef = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  useEffect(() => {
    if (!onSearchCount) return;
    if (q.length < 2) {
      onSearchCount({ count: 0, hasMore: false });
      return;
    }
    if (isLoading || isError) return;
    onSearchCount({ count: foods.length, hasMore: !!hasNextPage });
  }, [onSearchCount, q.length, isLoading, isError, foods.length, hasNextPage]);

  if (q.length < 2) return null;

  if (isLoading) {
    return <FoodCardsSkeleton showHeader={false} count={4} />;
  }

  if (isError) {
    return (
      <StateMessage kind="error" title="خطا در جستجو">
        مشکلی در دریافت نتایج جستجو رخ داده است.
        <div className="state-message__action">
          <button onClick={() => refetch()}>دوباره تلاش کنید</button>
        </div>
      </StateMessage>
    );
  }

  if (!foods.length) return null;

  return (
    <>
      <PopularFoodRow data={{ categoryTitle: "", foods }} hideTitle isSearchMode />

      {hasNextPage && (
        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
      )}

      {isFetchingNextPage && <FoodCardsSkeleton showHeader={false} count={2} />}
    </>
  );
}

function NormalModeFeed({ showAds }) {
  const loadMoreRef = useRef(null);

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
      // Limit to avoid infinite scrolls if the DB is huge (optional safety)
      if (loadedTitles.length >= 15) return undefined;
      return loadedTitles;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const uniquePages = useMemo(() => {
    const raw = data?.pages ?? [];
    const out = [];
    const seen = new Set();

    for (const entry of raw) {
      const items = Array.isArray(entry) ? entry : [entry];
      for (const p of items) {
        if (!p) continue;
        const key = p.categoryTitle || "__no_title__";
        if (!seen.has(key)) {
          out.push(p);
          seen.add(key);
        }
      }
    }
    return out;
  }, [data?.pages]);

  const feed = useMemo(() => {
    const blocks = [];
    if (showAds) blocks.push({ type: "ad", key: "ad-start" });

    uniquePages.forEach((page, idx) => {
      blocks.push({
        type: "popular",
        payload: page,
        key: `cat-${page.categoryTitle ?? idx}`,
      });
      if (showAds && (idx + 1) % 2 === 0) {
        blocks.push({ type: "ad", key: `ad-slot-${idx}` });
      }
    });

    return blocks;
  }, [uniquePages, showAds]);

  // ✅ Fixed Observer with proper guards and dependencies
  useEffect(() => {
    // If no more pages or already fetching, don't even start the observer
    if (!hasNextPage || isLoading) return;

    const observerCallback = (entries) => {
      const first = entries[0];
      if (
        first.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isLoading
      ) {
        fetchNextPage();
      }
    };

    const io = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: "600px 0px", // Pre-fetch before user reaches the very end
    });

    const currentTarget = loadMoreRef.current;
    if (currentTarget) {
      io.observe(currentTarget);
    }

    return () => {
      if (currentTarget) io.unobserve(currentTarget);
      io.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  if (isLoading) {
    return (
      <>
        <FoodCardsSkeleton count={4} title="غذاهای پرطرفدار" />
        {showAds && <BannerSkeleton height={260} />}
      </>
    );
  }

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

  if (!uniquePages.length) {
    return (
      <StateMessage kind="empty" title="موردی یافت نشد">
        هیچ <span className="state-message-subject">آیتم محبوبی</span> برای
        نمایش وجود ندارد.
      </StateMessage>
    );
  }

  return (
    <>
      {feed.map((block) =>
        block.type === "popular" ? (
          <div key={block.key} className="fade-in">
            <PopularFoodRow data={block.payload} />
          </div>
        ) : (
          <div key={block.key} className="fade-in">
            <AdBanner slotKey={block.key} height={260} overlay={0.5} />
          </div>
        ),
      )}

      {/* ✅ Persistent Loading Skeletons for Next Pages */}
      {isFetchingNextPage && (
        <div style={{ marginTop: "2.8rem" }}>
          <FoodCardsSkeleton showHeader={false} count={4} />
          {showAds && <BannerSkeleton height={260} />}
        </div>
      )}

      {/* Target for Infinite Scroll */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          style={{ height: "50px", visibility: "hidden" }}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default function PopularFoodAndAdBannerLazyList({
  searchQuery = "",
  categoryId = null,
  showAds = true,
  onSearchCount,
}) {
  const q = useMemo(() => normalizeFa(searchQuery), [searchQuery]);
  const isSearchMode = Boolean(q);

  useEffect(() => {
    if (!isSearchMode) onSearchCount?.(null);
  }, [isSearchMode, onSearchCount]);

  return isSearchMode ? (
    <SearchModeFoods q={q} categoryId={categoryId} onSearchCount={onSearchCount} />
  ) : (
    <NormalModeFeed showAds={showAds} />
  );
}

// src/pages/PopularFoodsBrowsePage.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "react-router-dom";

import SectionHeader from "../components/common/SectionHeader";
import StateMessage from "../components/common/StateMessage";
import ShimmerRow from "../components/common/ShimmerRow";
import FoodCard from "../components/home/FoodCard";
import useDocumentTitle from "../hooks/useDocumentTitle";

import {
  getPopularFoodByRandomCategory,
  getPopularFoodByRandomCategoryExcluding,
  browsePopularFoodsByCategory,
} from "../api/foods";

const TAKE = 6; // ✅ match Recent Orders exact page size

export default function PopularFoodsBrowsePage() {
  const { categoryId } = useParams(); // ✅ optional
  const location = useLocation();
  const categoryTitleFromState = location?.state?.categoryTitle;

  const isCategoryMode = !!categoryId;

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["popularFoodsBrowse", TAKE, categoryId ?? "all"],
    initialPageParam: isCategoryMode ? null : [],

    queryFn: ({ pageParam }) => {
      // ✅ Category view-all (real backend)
      if (isCategoryMode) {
        return browsePopularFoodsByCategory({
          categoryId,
          take: TAKE,
          cursor: pageParam, // string cursor or null
        });
      }

      // ✅ Global browse (existing random-group logic)
      return !pageParam || pageParam.length === 0
        ? getPopularFoodByRandomCategory(TAKE)
        : getPopularFoodByRandomCategoryExcluding(pageParam, TAKE);
    },

    getNextPageParam: (lastPage, allPages) => {
      // Category mode: PagedResultDto<HomeFoodCardDto>
      if (isCategoryMode) {
        return lastPage?.hasMore ? lastPage?.nextCursor : undefined;
      }

      // Global mode: PopularFoodsDto blocks, backend may return null for 204
      if (!lastPage) return undefined;
      return allPages.map((p) => p?.categoryTitle).filter(Boolean);
    },

    refetchOnMount: "always",
    staleTime: 60 * 1000,
    retry: 1,
  });

  const items = useMemo(() => {
    if (isCategoryMode) {
      // pages: { items, nextCursor, hasMore }
      const flat = (data?.pages ?? []).flatMap((p) => p?.items ?? []);
      const seen = new Set();
      return flat.filter((x) => {
        const id = x?.id ?? x?.foodId;
        const key = id != null ? String(id) : `${x?.name}-${x?.restaurantId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // global mode: pages are PopularFoodsDto, flatten foods
    const flatFoods = (data?.pages ?? [])
      .filter(Boolean)
      .flatMap((p) => p?.foods ?? []);

    const seen = new Set();
    return flatFoods.filter((x) => {
      const id = x?.id ?? x?.foodId;
      const key = id != null ? String(id) : `${x?.name}-${x?.restaurantId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data, isCategoryMode]);

  const headerTitle = isCategoryMode
    ? categoryTitleFromState
      ? `${categoryTitleFromState}‌های پرطرفدار`
      : "محبوب‌ترین غذاها"
    : "محبوب‌ترین غذاها";

  const header = <SectionHeader title={headerTitle} linkText="بازگشت" to="/" />;

  // Infinite scroll sentinel (exact same config as RecentOrdersBrowsePage)
  const loadMoreRef = useRef(null);
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const el = loadMoreRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "400px", threshold: 0 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <main className="content">
        <section className="previous-orders">
          {header}
          <ShimmerRow height={220} style={{ margin: "16px 0" }} />
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="content">
        <section className="previous-orders">
          {header}
          <StateMessage kind="error" title="خطا در دریافت غذاهای محبوب">
            خطایی در دریافت غذاهای محبوب رخ داده است.
            <div className="state-message__action">
              <button onClick={() => refetch()}>دوباره تلاش کنید</button>
            </div>
          </StateMessage>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="content">
        <section className="previous-orders">
          {header}
          <StateMessage kind="empty" title="موردی یافت نشد">
            آیتمی برای نمایش وجود ندارد.
          </StateMessage>
        </section>
      </main>
    );
  }

  return (
    <main className="content">
      <section className="previous-orders">
        {header}

        {/* ✅ exact same layout classes as RecentOrdersBrowsePage */}
        <div className="food-cards-container food-cards-container--search ">
          {items.map((item) => (
            <div
              key={item.id ?? item.foodId}
              className="food-card-wrap--search"
            >
              <FoodCard item={item} />
            </div>
          ))}
        </div>

        {/* sentinel */}
        <div ref={loadMoreRef} style={{ height: 1 }} />

        {/* loading indicator */}
        {isFetchingNextPage && (
          <ShimmerRow height={220} style={{ margin: "16px 0" }} />
        )}

        {/* optional fallback button */}
        {hasNextPage && !isFetchingNextPage && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "16px 0",
            }}
          >
            <button onClick={() => fetchNextPage()}>بارگذاری بیشتر</button>
          </div>
        )}
      </section>
    </main>
  );
}

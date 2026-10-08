// src/pages/PopularFoodsBrowsePage.jsx
import React, { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "react-router-dom";

import SectionHeader from "../components/common/SectionHeader";
import StateMessage from "../components/common/StateMessage";
import ShimmerRow from "../components/common/ShimmerRow";
import BrowsePageLayout from "../components/common/BrowsePageLayout";
import FoodCard from "../components/home/FoodCard";
import SearchResultsSection from "../components/home/SearchResultsSection";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import resolveFileUrl from "../utils/resolveFileUrl";

import {
  getPopularFoodByRandomCategory,
  getPopularFoodByRandomCategoryExcluding,
  browsePopularFoodsByCategory,
} from "../api/foods";

const TAKE = 6;

export default function PopularFoodsBrowsePage() {
  const { categoryId } = useParams(); // optional
  const location = useLocation();
  const categoryTitleFromState = location?.state?.categoryTitle;
  const categoryIconFromState = location?.state?.svgIcon;
  const isCategoryMode = !!categoryId;

  const [searchQuery, setSearchQuery] = useState("");
  const trimmedQuery = searchQuery.trim();
  const isSearchActive = Boolean(trimmedQuery);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["popularFoodsBrowse", TAKE, categoryId ?? "all"],
    initialPageParam: isCategoryMode ? null : [],
    enabled: !isSearchActive,

    queryFn: ({ pageParam }) => {
      if (isCategoryMode) {
        return browsePopularFoodsByCategory({
          categoryId,
          take: TAKE,
          cursor: pageParam, // string cursor or null
        });
      }
      return !pageParam || pageParam.length === 0
        ? getPopularFoodByRandomCategory(TAKE)
        : getPopularFoodByRandomCategoryExcluding(pageParam, TAKE);
    },

    getNextPageParam: (lastPage, allPages) => {
      if (isCategoryMode) {
        return lastPage?.hasMore ? lastPage?.nextCursor : undefined;
      }
      if (!lastPage) return undefined;
      return allPages.map((p) => p?.categoryTitle).filter(Boolean);
    },

    refetchOnMount: "always",
    staleTime: 60 * 1000,
    retry: 1,
  });

  const items = useMemo(() => {
    const pages = (data?.pages ?? []).filter(Boolean);
    const flat = isCategoryMode
      ? pages.flatMap((p) => p?.items ?? [])
      : pages.flatMap((p) => p?.foods ?? []);

    const seen = new Set();
    return flat.filter((x) => {
      const id = x?.id ?? x?.foodId;
      const key = id != null ? String(id) : `${x?.name}-${x?.restaurantId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data, isCategoryMode]);

  const headerTitle =
    isCategoryMode && categoryTitleFromState
      ? `${categoryTitleFromState}‌های پرطرفدار`
      : "محبوب‌ترین غذاها";

  const sentinelRef = useInfiniteScroll({
    hasNextPage: !!hasNextPage && !isSearchActive,
    isFetchingNextPage,
    fetchNextPage,
  });

  const categoryIcon = categoryIconFromState ? (
    <img
      src={resolveFileUrl(categoryIconFromState)}
      alt=""
      className="popular-food-row__category-icon"
      aria-hidden="true"
    />
  ) : null;

  const header = <SectionHeader icon={categoryIcon} title={headerTitle} />;

  let body;

  if (isSearchActive) {
    body = (
      <SearchResultsSection
        key={`${categoryId ?? "all"}-${trimmedQuery}`}
        query={searchQuery}
        categoryId={categoryId ?? null}
      />
    );
  } else if (isLoading) {
    body = (
      <section className="previous-orders">
        {header}
        <ShimmerRow height={220} style={{ margin: "16px 0" }} />
      </section>
    );
  } else if (isError) {
    body = (
      <section className="previous-orders">
        {header}
        <StateMessage kind="error" title="خطا در دریافت غذاهای محبوب">
          خطایی در دریافت غذاهای محبوب رخ داده است.
          <div className="state-message__action">
            <button onClick={() => refetch()}>دوباره تلاش کنید</button>
          </div>
        </StateMessage>
      </section>
    );
  } else if (items.length === 0) {
    body = (
      <section className="previous-orders">
        {header}
        <StateMessage kind="empty" title="موردی یافت نشد">
          آیتمی برای نمایش وجود ندارد.
        </StateMessage>
      </section>
    );
  } else {
    body = (
      <section className="previous-orders">
        {header}

        <div className="food-cards-container food-cards-container--search">
          {items.map((item) => (
            <div
              key={item.id ?? item.foodId}
              className="food-card-wrap--search"
            >
              <FoodCard item={item} />
            </div>
          ))}
        </div>

        {hasNextPage && (
          <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
        )}

        {isFetchingNextPage && (
          <ShimmerRow height={220} style={{ margin: "16px 0" }} />
        )}
      </section>
    );
  }

  return (
    <BrowsePageLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      {body}
    </BrowsePageLayout>
  );
}
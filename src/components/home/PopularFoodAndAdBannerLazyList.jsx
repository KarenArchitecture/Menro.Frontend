// src/components/home/PopularFoodAndAdBannerLazyList.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getPopularFoodByRandomCategory,
  getPopularFoodByRandomCategoryExcluding,
} from "../../api/foods";
import { publicSearch } from "../../api/search";
import PopularFoodRow from "./PopularFoodRow";
import AdBanner from "./AdBanner";
import LoadingSpinner from "../common/LoadingSpinner";
import ShimmerRow from "../common/ShimmerRow";
import StateMessage from "../common/StateMessage";

const normalizeFa = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();

function SearchModeFoods({ q, onSearchCount }) {
  const searchQ = useQuery({
    queryKey: ["foodSearchDb", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      const res = await publicSearch(q, 80);
      const items = res?.items ?? [];

      return items
        .filter((x) => x?.type === "Food")
        .map((x) => ({
          id: x.id,
          name: x.title,
          imageUrl: x.imageUrl,
          restaurantName: x.subtitle,
          restaurantId: x.restaurantId,
          restaurantSlug: x.restaurantSlug,
          restaurantPath:
            x.targetUrl || (x.restaurantSlug ? `/restaurant/${x.restaurantSlug}` : undefined),
          rating: Number(x.rating) || 0,
          voters: x.voters ?? 0,
        }));
    },
    staleTime: 30_000,
    retry: 1,
  });

  // count
  useEffect(() => {
    if (!onSearchCount) return;
    if (q.length < 2) {
      onSearchCount(0);
      return;
    }
    if (searchQ.isLoading || searchQ.isError) return;
    onSearchCount((searchQ.data ?? []).length);
  }, [onSearchCount, q.length, searchQ.isLoading, searchQ.isError, searchQ.data]);

  if (q.length < 2) return null;

  if (searchQ.isLoading) return <LoadingSpinner />;

  if (searchQ.isError) {
    return (
      <StateMessage kind="error" title="خطا در جستجو">
        مشکلی در دریافت نتایج جستجو رخ داده است.
        <div className="state-message__action">
          <button onClick={() => searchQ.refetch()}>دوباره تلاش کنید</button>
        </div>
      </StateMessage>
    );
  }

  const foods = searchQ.data ?? [];
  if (!foods.length) return null; // HomePage shows the global empty message

  return <PopularFoodRow data={{ categoryTitle: "", foods }} hideTitle isSearchMode />;
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
      const loadedTitles = allPages.map((p) => p?.categoryTitle).filter(Boolean);
      return loadedTitles;
    },
    staleTime: 60_000,
    retry: 1,
  });

  // Normalize pages
  const pages = useMemo(() => {
    const raw = data?.pages ?? [];
    const out = [];
    for (const entry of raw) {
      if (Array.isArray(entry)) out.push(...entry);
      else if (entry) out.push(entry);
    }
    return out.filter(Boolean);
  }, [data]);

  // Deduplicate categories
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

  const feed = useMemo(() => {
    const blocks = [];
    if (showAds) blocks.push({ type: "ad", key: "ad-start" });

    uniquePages.forEach((page, idx) => {
      blocks.push({ type: "popular", payload: page, key: `cat-${page.categoryTitle ?? idx}` });
      if (showAds && (idx + 1) % 2 === 0) blocks.push({ type: "ad", key: `ad-${idx}` });
    });

    return blocks;
  }, [uniquePages, showAds]);

  // Infinite load observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0, rootMargin: "800px 0px" }
    );

    io.observe(loadMoreRef.current);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) return <LoadingSpinner />;

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

  if (!pages.length) {
    return (
      <StateMessage kind="empty" title="موردی یافت نشد">
        هیچ <span className="state-message-subject">آیتم محبوبی</span> برای نمایش وجود ندارد.
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
            <AdBanner
              slotKey={block.key}
              height={260}
              overlay={0.5}
              objectPosition="center"
            />
          </div>
        )
      )}

      {isFetchingNextPage && (
        <>
          <PopularFoodRow isLoading />
          {showAds && <ShimmerRow height={260} style={{ margin: "2.8rem auto" }} />}
        </>
      )}

      {hasNextPage && (
        <div ref={loadMoreRef} style={{ height: 1, marginTop: -1 }} aria-hidden="true" />
      )}
    </>
  );
}

export default function PopularFoodAndAdBannerLazyList({
  searchQuery = "",
  showAds = true,
  onSearchCount,
}) {
  const q = useMemo(() => normalizeFa(searchQuery), [searchQuery]);
  const isSearchMode = Boolean(q);

  // when not searching, reset count to null (same behavior as before)
  useEffect(() => {
    if (!isSearchMode) onSearchCount?.(null);
  }, [isSearchMode, onSearchCount]);

  return isSearchMode ? (
    <SearchModeFoods q={q} onSearchCount={onSearchCount} />
  ) : (
    <NormalModeFeed showAds={showAds} />
  );
}


// src/components/home/RestaurantList.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import SectionHeader from "../common/SectionHeader";
import RestaurantCard from "./RestaurantCard";
import StateMessage from "../common/StateMessage";
import StarIcon2 from "../icons/StarIcon2";
import { RestaurantCardsSkeleton } from "./HomeSkeletons";
import { getRandomRestaurants } from "../../api/restaurants";
import usePagedSearch from "../../hooks/usePagedSearch";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { normalizeFa } from "../../utils/normalizeFa";
import { mapSearchRestaurant } from "../../utils/searchMappers";

function RestaurantList({ searchQuery = "", categoryId = null, onSearchCount }) {
  const q = useMemo(() => normalizeFa(searchQuery), [searchQuery]);
  const isSearchMode = Boolean(q);
  const rowRef = useRef(null);

  // حالت عادی: ۸ رستوران رندوم (کش ۵ دقیقه‌ای بک‌اند)
  const randomQ = useQuery({
    queryKey: ["randomRestaurants"],
    queryFn: getRandomRestaurants,
    enabled: !isSearchMode,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  // حالت جستجو: صفحه‌بندی‌شده
  const searchQ = usePagedSearch({
    term: q,
    type: "Restaurant",
    categoryId,
    enabled: isSearchMode,
    map: mapSearchRestaurant,
  });

  const restaurants = isSearchMode ? searchQ.items : (randomQ.data ?? []);
  const isLoading = isSearchMode ? searchQ.isLoading : randomQ.isLoading;
  const isError = isSearchMode ? searchQ.isError : randomQ.isError;
  const refetch = isSearchMode ? searchQ.refetch : randomQ.refetch;

  // اسکرول بی‌نهایت افقی (فقط حالت جستجو)
  const sentinelRef = useInfiniteScroll({
    hasNextPage: isSearchMode && !!searchQ.hasNextPage,
    isFetchingNextPage: searchQ.isFetchingNextPage,
    fetchNextPage: searchQ.fetchNextPage,
    rootRef: rowRef,
    rootMargin: "0px 400px 0px 400px",
  });

  useEffect(() => {
    if (!onSearchCount) return;

    if (!isSearchMode) {
      onSearchCount(null);
      return;
    }
    if (isLoading || isError) return;

    onSearchCount({
      count: restaurants.length,
      hasMore: !!searchQ.hasNextPage,
    });
  }, [
    onSearchCount,
    isSearchMode,
    isLoading,
    isError,
    restaurants.length,
    searchQ.hasNextPage,
  ]);

  const showSeeMore = !isSearchMode;

  return (
    <section className="restaurants">
      <SectionHeader
        icon={<StarIcon2 />}
        title="رستوران‌ و کافه‌ها"
        linkText="مشاهده همه"
        to={showSeeMore ? "/restaurants" : undefined}
      />

      {isLoading && <RestaurantCardsSkeleton showHeader={false} />}

      {isError && (
        <StateMessage kind="error" title="خطا در دریافت رستوران‌ها">
          مشکلی در دریافت اطلاعات رستوران‌ها رخ داده است.
          <div className="state-message__action">
            <button type="button" onClick={() => refetch()}>
              دوباره تلاش کنید
            </button>
          </div>
        </StateMessage>
      )}

      {!isLoading && !isError && !restaurants.length && (
        <StateMessage kind="empty" title="موردی یافت نشد">
          هیچ <span className="state-message-subject">رستورانی</span> برای نمایش موجود نیست.
        </StateMessage>
      )}

      {!isLoading && !isError && restaurants.length > 0 && (
        <div className="cards-container" ref={rowRef}>
          {restaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={{
                name: r.name,
                category: r.category,
                openTime: r.openTime,
                closeTime: r.closeTime,
                discount: r.discount || 0,
                rating: Number(r.rating) || 0,
                voters: r.voters || 0,
                bannerImageUrl: r.bannerImageUrl,
                logoImageUrl: r.logoImageUrl,
                isOpen: !!r.isOpen,
                slug: r.slug,
              }}
            />
          ))}

          {isSearchMode && searchQ.hasNextPage && (
            <div ref={sentinelRef} className="cards-sentinel" aria-hidden="true" />
          )}
        </div>
      )}
    </section>
  );
}

export default RestaurantList;
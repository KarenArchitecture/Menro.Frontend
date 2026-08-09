// src/components/home/RestaurantList.jsx

import React, { useEffect, useMemo } from "react";
import SectionHeader from "../common/SectionHeader";
import RestaurantCard from "./RestaurantCard";
import { useQuery } from "@tanstack/react-query";
import { getRandomRestaurants } from "../../api/restaurants";
import { publicSearch } from "../../api/search";
import StateMessage from "../common/StateMessage";
import StarIcon2 from "../icons/StarIcon2";
import { RestaurantCardsSkeleton } from "./HomeSkeletons";


const normalizeFa = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();

function RestaurantList({ searchQuery = "", onSearchCount }) {
  const q = useMemo(() => normalizeFa(searchQuery), [searchQuery]);
  const isSearchMode = Boolean(q);

  const {
    data: restaurants = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: isSearchMode ? ["restaurantSearchDb", q] : ["randomRestaurants"],
    queryFn: async () => {
      if (!isSearchMode) return getRandomRestaurants();

      const res = await publicSearch(q, 50);
      const items = res?.items ?? [];

      // convert SearchItemDto -> shape your UI already uses
      return items
        .filter((x) => x?.type === "Restaurant")
        .map((x) => ({
          id: x.id,
          name: x.title,
          category: x.category ?? "",
          openTime: x.openTime ?? null,
          closeTime: x.closeTime ?? null,
          discount: x.discount ?? 0,
          rating: Number(x.rating) || 0,
          voters: x.voters ?? 0,
          bannerImageUrl: x.imageUrl,
          logoImageUrl: x.logoImageUrl,
          isOpen: !!x.isOpen,
          slug: x.restaurantSlug,
        }));
    },
    // 🔧 The "random 8" endpoint is backend-cached for 5 minutes
    // (IMemoryCache in RestaurantRepository) — the same 8 restaurants come
    // back regardless of how often we ask within that window. Matching
    // staleTime here means react-query won't even bother re-requesting on
    // remount/refocus during that window, saving a full round-trip for
    // data that hasn't changed anyway. Search mode gets a much shorter
    // staleTime since it reflects live typed queries, not a cached set.
    staleTime: isSearchMode ? 30_000 : 5 * 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (!onSearchCount) return;

    if (!isSearchMode) {
      onSearchCount(null);
      return;
    }

    if (isLoading || isError) return;

    onSearchCount(restaurants.length);
  }, [onSearchCount, isSearchMode, isLoading, isError, restaurants.length]);

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
        <div className="cards-container">
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
        </div>
      )}
    </section>
  );
}

export default RestaurantList;
